param(
  [Parameter(Mandatory = $true)]
  [string]$InterfaceAlias,
  [ValidateSet(3000, 3001)]
  [int]$BackendPort = 3000
)

$ErrorActionPreference = 'Stop'
$androidWindowsIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
$androidWindowsPrincipal = [Security.Principal.WindowsPrincipal]::new($androidWindowsIdentity)
if (-not $androidWindowsPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  throw 'Ejecuta este script desde PowerShell como administrador. Solo para una LAN de confianza.'
}
$androidNetwork = Get-NetConnectionProfile -InterfaceAlias $InterfaceAlias
if ($androidNetwork.NetworkCategory -eq 'DomainAuthenticated') {
  throw 'El perfil está administrado por un dominio; consulta al administrador de esa red.'
}
Set-NetConnectionProfile -InterfaceAlias $InterfaceAlias -NetworkCategory Private
foreach ($androidPort in @($BackendPort, 8000)) {
  $androidRuleName = 'EMERGEN-APK-LAN-' + $androidPort
  if (-not (Get-NetFirewallRule -Name $androidRuleName -ErrorAction SilentlyContinue)) {
    New-NetFirewallRule -Name $androidRuleName -DisplayName ('EMERGEN APK LAN TCP ' + $androidPort) `
      -Direction Inbound -Action Allow -Protocol TCP -LocalPort $androidPort `
      -Profile Private -RemoteAddress LocalSubnet | Out-Null
  }
}
Get-NetConnectionProfile -InterfaceAlias $InterfaceAlias | Select-Object InterfaceAlias,NetworkCategory
Get-NetFirewallRule -Name 'EMERGEN-APK-LAN-*' | Select-Object Name,Enabled,Profile
