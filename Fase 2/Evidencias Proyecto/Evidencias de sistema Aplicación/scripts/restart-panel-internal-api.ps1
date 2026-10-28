$ErrorActionPreference = 'Stop'
$raizAplicacion = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
$servicioPanel = Join-Path $raizAplicacion 'services\internal-api'
$pythonPanel = Join-Path $servicioPanel '.venv\Scripts\python.exe'
$procesosPanel = @(Get-CimInstance Win32_Process -Filter "Name='python.exe'")
$lanzadoresPanel = @($procesosPanel | Where-Object {
  $_.CommandLine -and $_.CommandLine.Contains($pythonPanel) -and
  $_.CommandLine -match '-m uvicorn app\.main:app' -and $_.CommandLine -match '--port 8000'
})
if ($lanzadoresPanel.Count -ne 1) {
  throw 'No se identificó una única instancia de la API interna de este proyecto; no se detuvo ningún proceso.'
}
$lanzadorPanel = $lanzadoresPanel[0]
$hijosPanel = @($procesosPanel | Where-Object { $_.ParentProcessId -eq $lanzadorPanel.ProcessId })
if (@($hijosPanel | Where-Object { $_.CommandLine -notmatch '-m uvicorn app\.main:app' }).Count) {
  throw 'El lanzador tiene procesos inesperados; no se detuvo ningún proceso.'
}
foreach ($procesoPanel in $hijosPanel) { Stop-Process -Id $procesoPanel.ProcessId -ErrorAction Stop }
if (Get-Process -Id $lanzadorPanel.ProcessId -ErrorAction SilentlyContinue) {
  Stop-Process -Id $lanzadorPanel.ProcessId -ErrorAction Stop
}
$logPanel = Join-Path $servicioPanel '.runtime\panel-api.log'
$errorPanel = Join-Path $servicioPanel '.runtime\panel-api-error.log'
$nuevoPanel = Start-Process -FilePath $pythonPanel -ArgumentList '-m', 'uvicorn', 'app.main:app', '--host', 'localhost', '--port', '8000' -WorkingDirectory $servicioPanel -WindowStyle Hidden -RedirectStandardOutput $logPanel -RedirectStandardError $errorPanel -PassThru
Write-Output "API interna reiniciada. PID del lanzador: $($nuevoPanel.Id)"
