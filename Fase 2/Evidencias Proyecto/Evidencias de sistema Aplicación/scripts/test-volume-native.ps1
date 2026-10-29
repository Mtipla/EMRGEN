$ErrorActionPreference = 'Stop'
$volumeRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
. (Join-Path $PSScriptRoot 'android-env.ps1')
Push-Location -LiteralPath (Join-Path $volumeRoot 'apps\mobile\android')
try {
  # PowerShell 5 puede tratar advertencias de stderr como errores al redirigir. Verificamos el código real.
  $ErrorActionPreference = 'Continue'
  & .\gradlew.bat :app:compileDebugUnitTestJavaWithJavac --no-daemon
  $volumeCompileExit = $LASTEXITCODE
  $ErrorActionPreference = 'Stop'
  if ($volumeCompileExit -ne 0) { throw 'Falló la compilación de las pruebas nativas.' }
} finally { Pop-Location }
$volumeGradleCache = if ($env:GRADLE_USER_HOME) { $env:GRADLE_USER_HOME } else { Join-Path $env:USERPROFILE '.gradle' }
$volumeJunit = Get-ChildItem -LiteralPath (Join-Path $volumeGradleCache 'caches\modules-2\files-2.1\junit\junit') -Recurse -Filter 'junit-4.13.2.jar' | Select-Object -First 1
$volumeHamcrest = Get-ChildItem -LiteralPath (Join-Path $volumeGradleCache 'caches\modules-2\files-2.1\org.hamcrest\hamcrest-core') -Recurse -Filter 'hamcrest-core-1.3.jar' | Select-Object -First 1
if (-not $volumeJunit -or -not $volumeHamcrest) { throw 'Faltan los JAR binarios de JUnit/Hamcrest en la caché de Gradle.' }
$volumeClasses = Join-Path $volumeRoot 'apps\mobile\android\app\build\intermediates\javac'
$volumeClassPath = @((Join-Path $volumeClasses 'debugUnitTest\compileDebugUnitTestJavaWithJavac\classes'),
  (Join-Path $volumeClasses 'debug\compileDebugJavaWithJavac\classes'), $volumeJunit.FullName, $volumeHamcrest.FullName) -join ';'
# JUnit directo evita el ClassNotFoundException observado en el worker de Gradle con esta ruta Windows.
& (Join-Path $env:JAVA_HOME 'bin\java.exe') -cp $volumeClassPath org.junit.runner.JUnitCore com.emergen.mobile.VolumeSequenceMatcherTest com.emergen.mobile.VolumeLocationPolicyTest
if ($LASTEXITCODE -ne 0) { throw 'Fallaron las pruebas del reconocedor. No se accede a APIs ni se envían SOS en estas pruebas.' }
