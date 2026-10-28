$ErrorActionPreference = 'Stop'
$androidBuildRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
Push-Location -LiteralPath $androidBuildRoot
try {
  . (Join-Path $PSScriptRoot 'android-env.ps1')
  & node (Join-Path $PSScriptRoot 'mobile-android.mjs') prepare
  if ($LASTEXITCODE -ne 0) { throw 'Falló el build web o la sincronización; no se compiló un dist anterior.' }
  # La primera preparación puede haber creado android/ después de android-env.
  . (Join-Path $PSScriptRoot 'android-env.ps1')
  Push-Location -LiteralPath (Join-Path $androidBuildRoot 'apps\mobile\android')
  try {
    & .\gradlew.bat --version
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo verificar la JVM de Gradle.' }
    & .\gradlew.bat assembleDebug --no-daemon
    if ($LASTEXITCODE -ne 0) { throw 'Falló assembleDebug.' }
    $androidApk = Join-Path (Get-Location).Path 'app\build\outputs\apk\debug\app-debug.apk'
    Write-Output ('APK: ' + $androidApk)
    Write-Output ('Bytes: ' + (Get-Item -LiteralPath $androidApk).Length)
    Write-Output ('SHA-256: ' + (Get-FileHash -LiteralPath $androidApk -Algorithm SHA256).Hash)
  } finally { Pop-Location }
} finally { Pop-Location }
