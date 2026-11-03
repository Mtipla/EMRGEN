param([string]$Source)

$ErrorActionPreference = 'Stop'
$iconRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
if (-not $Source) { $Source = Join-Path $iconRoot 'apps\mobile\resources\icon.png' }
Add-Type -AssemblyName System.Drawing
$iconSource = [System.Drawing.Image]::FromFile((Resolve-Path -LiteralPath $Source).Path)
try {
  $densities = @(
    @{ Name = 'mdpi'; Size = 48; Foreground = 108 },
    @{ Name = 'hdpi'; Size = 72; Foreground = 162 },
    @{ Name = 'xhdpi'; Size = 96; Foreground = 216 },
    @{ Name = 'xxhdpi'; Size = 144; Foreground = 324 },
    @{ Name = 'xxxhdpi'; Size = 192; Foreground = 432 }
  )
  foreach ($density in $densities) {
    $folder = Join-Path $iconRoot ('apps\mobile\android\app\src\main\res\mipmap-' + $density.Name)
    foreach ($name in @('ic_launcher', 'ic_launcher_round', 'ic_launcher_foreground')) {
      $size = if ($name -eq 'ic_launcher_foreground') { $density.Foreground } else { $density.Size }
      $bitmap = [System.Drawing.Bitmap]::new($size, $size)
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      try {
        $graphics.Clear([System.Drawing.Color]::White)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.DrawImage($iconSource, [System.Drawing.Rectangle]::new(0, 0, $size, $size))
        $bitmap.Save((Join-Path $folder ($name + '.png')), [System.Drawing.Imaging.ImageFormat]::Png)
      } finally { $graphics.Dispose(); $bitmap.Dispose() }
    }
  }
} finally { $iconSource.Dispose() }
Write-Output 'Generados 15 iconos Android con fondo blanco.'
