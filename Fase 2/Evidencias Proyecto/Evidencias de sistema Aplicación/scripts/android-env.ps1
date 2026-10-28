param(
  [string]$JdkPath,
  [string]$SdkPath
)

$ErrorActionPreference = 'Stop'
$androidRepoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$androidLocalConfigPath = Join-Path $androidRepoRoot '.android.local.json'
$androidLocalConfig = if (Test-Path -LiteralPath $androidLocalConfigPath) {
  Get-Content -Raw -Encoding utf8 -LiteralPath $androidLocalConfigPath | ConvertFrom-Json
} else { $null }

if (-not $JdkPath) { $JdkPath = $androidLocalConfig.jdkPath }
if (-not $JdkPath) { $JdkPath = $env:JAVA_HOME }
if (-not $SdkPath) { $SdkPath = $androidLocalConfig.sdkPath }
if (-not $SdkPath) { $SdkPath = $env:ANDROID_HOME }
if (-not $SdkPath) { $SdkPath = Join-Path $env:LOCALAPPDATA 'Android\Sdk' }
if (-not $JdkPath -or -not (Test-Path -LiteralPath (Join-Path $JdkPath 'release'))) {
  throw 'Configura un JDK 21 en .android.local.json (ver .android.local.example.json) o JAVA_HOME.'
}
$androidJdkRelease = Get-Content -Raw -LiteralPath (Join-Path $JdkPath 'release')
if ($androidJdkRelease -notmatch '(?m)^JAVA_VERSION="21[.\"]') {
  throw 'Esta plantilla utiliza JDK 21. No uses el Java 8 del PATH ni el JBR 25 de Android Studio.'
}
if (-not (Test-Path -LiteralPath (Join-Path $SdkPath 'platforms\android-36\android.jar'))) {
  throw 'Falta Android SDK Platform 36. Instálala desde SDK Manager; tener solo API 37 no basta.'
}
if (-not (Test-Path -LiteralPath (Join-Path $SdkPath 'build-tools\36.0.0\aapt2.exe'))) {
  throw 'Faltan Android SDK Build-Tools 36.0.0 en SDK Manager.'
}
if (-not (Test-Path -LiteralPath (Join-Path $SdkPath 'platform-tools\adb.exe'))) {
  throw 'Faltan Android SDK Platform-Tools (ADB) en SDK Manager.'
}
$env:JAVA_HOME = (Resolve-Path -LiteralPath $JdkPath).Path
$env:ANDROID_HOME = (Resolve-Path -LiteralPath $SdkPath).Path
$env:PATH = (Join-Path $env:JAVA_HOME 'bin') + ';' + (Join-Path $env:ANDROID_HOME 'platform-tools') + ';' + $env:PATH
$androidProjectDir = Join-Path $androidRepoRoot 'apps\mobile\android'
function ConvertTo-AndroidJavaProperty([string]$PropertyPath) {
  # Properties de Java/Studio: escapar Unicode conserva las rutas con "Aplicación" en Windows.
  -join @($PropertyPath.Replace('\', '/').ToCharArray() | ForEach-Object {
    if ([int]$_ -gt 127) { '\u{0:x4}' -f [int]$_ } else { [string]$_ }
  })
}
if (Test-Path -LiteralPath $androidProjectDir) {
  $androidUtf8 = [Text.UTF8Encoding]::new($false)
  [IO.File]::WriteAllText((Join-Path $androidProjectDir 'local.properties'),
    'sdk.dir=' + (ConvertTo-AndroidJavaProperty $env:ANDROID_HOME) + "`n", $androidUtf8)
  $androidGradleLocal = Join-Path $androidProjectDir '.gradle'
  New-Item -ItemType Directory -Force -Path $androidGradleLocal | Out-Null
  # Android Studio: seleccionar GRADLE_LOCAL_JAVA_HOME como Gradle JDK.
  [IO.File]::WriteAllText((Join-Path $androidGradleLocal 'config.properties'),
    'java.home=' + (ConvertTo-AndroidJavaProperty $env:JAVA_HOME) + "`n", $androidUtf8)
  $androidIdeaDir = Join-Path $androidProjectDir '.idea'
  $androidIdeaGradle = Join-Path $androidIdeaDir 'gradle.xml'
  if (-not (Test-Path -LiteralPath $androidIdeaGradle)) {
    New-Item -ItemType Directory -Force -Path $androidIdeaDir | Out-Null
    [IO.File]::WriteAllText($androidIdeaGradle, @'
<?xml version="1.0" encoding="UTF-8"?>
<project version="4">
  <component name="GradleSettings">
    <option name="linkedExternalProjectsSettings">
      <GradleProjectSettings>
        <option name="externalProjectPath" value="$PROJECT_DIR$" />
        <option name="gradleJvm" value="#GRADLE_LOCAL_JAVA_HOME" />
      </GradleProjectSettings>
    </option>
  </component>
</project>
'@, $androidUtf8)
  }
}
Write-Output "JAVA_HOME=$env:JAVA_HOME"
Write-Output "ANDROID_HOME=$env:ANDROID_HOME"
