<#
.SYNOPSIS
  Prueba manual del panel admin y la bitacora contra un backend en ejecucion.

.DESCRIPTION
  1. Inicia sesion como administrador.
  2. Lista usuarios (GET /admin/usuarios).
  3. Opcional (-UsuarioId): bloquea y reactiva a ese usuario; ambas acciones quedan en la bitacora.
  4. Lista la bitacora (GET /admin/auditoria).
  5. Descarga el PDF de la bitacora generado por jsReport (GET /admin/auditoria/reporte).
     Si jsReport no esta levantado, informa el error 502 y el resto de la prueba sigue valida.

  Requiere un usuario con rol 1 (ver README_BDD.md: admin@emergen.cl / Admin12345).

.EXAMPLE
  .\probar-auditoria.ps1                                   # backend local (npm run start:dev)
  .\probar-auditoria.ps1 -ApiUrl http://localhost:3001     # backend en Docker
  .\probar-auditoria.ps1 -UsuarioId 2                      # ademas bloquea y reactiva al usuario 2
#>
param(
  [string]$ApiUrl = 'http://localhost:3000',
  [string]$Correo = 'admin@emergen.cl',
  [string]$Password = 'Admin12345',
  [int]$UsuarioId = 0,
  [string]$Salida = (Get-Location).Path
)
$ErrorActionPreference = 'Stop'

function Paso([string]$texto) { Write-Host "`n== $texto" -ForegroundColor Cyan }

Paso "Login como $Correo en $ApiUrl"
$credenciales = @{ correo_usuario = $Correo; password = $Password } | ConvertTo-Json
$login = Invoke-RestMethod -Method Post -Uri "$ApiUrl/usuarios/login" -ContentType 'application/json' -Body $credenciales
$headers = @{ Authorization = "Bearer $($login.access_token)" }
Write-Host "Sesion iniciada: usuario_ID $($login.usuario.usuario_ID)" -ForegroundColor Green

Paso 'Usuarios (GET /admin/usuarios)'
Invoke-RestMethod -Uri "$ApiUrl/admin/usuarios" -Headers $headers |
  Format-Table usuario_ID, nombre_usuario, correo_usuario, rol_ID, estado_ID -AutoSize | Out-Host

if ($UsuarioId -gt 0) {
  Paso "Bloquear (3) y reactivar (1) al usuario $UsuarioId (PUT /admin/usuarios/:id/estado)"
  foreach ($estado in 3, 1) {
    $cuerpo = @{ estado_ID = $estado } | ConvertTo-Json
    Invoke-RestMethod -Method Put -Uri "$ApiUrl/admin/usuarios/$UsuarioId/estado" -Headers $headers -ContentType 'application/json' -Body $cuerpo |
      Format-Table usuario_ID, nombre_usuario, estado_ID -AutoSize | Out-Host
  }
}

Paso 'Bitacora (GET /admin/auditoria?limite=10), fechas en UTC'
Invoke-RestMethod -Uri "$ApiUrl/admin/auditoria?limite=10" -Headers $headers |
  Format-Table fecha_accion, nombre_usuario, origen_aplicacion, accion_realizada -AutoSize | Out-Host

Paso 'Reporte PDF con jsReport (GET /admin/auditoria/reporte)'
$pdf = Join-Path $Salida "bitacora-$(Get-Date -Format yyyy-MM-dd).pdf"
try {
  Invoke-WebRequest -Uri "$ApiUrl/admin/auditoria/reporte?limite=50" -Headers $headers -OutFile $pdf -UseBasicParsing
  Write-Host "PDF guardado en $pdf" -ForegroundColor Green
} catch {
  $status = [int]$_.Exception.Response.StatusCode
  Write-Host "jsReport no genero el PDF (HTTP $status): $($_.ErrorDetails.Message)" -ForegroundColor Yellow
  Write-Host 'Levantalo con: docker start jsreport   (primera vez: docker run -d --name jsreport -p 5488:5488 jsreport/jsreport)'
}
