# =============================================================================
# Package World Clocks Chrome Extension for Chrome Web Store Upload
# Usage: powershell -ExecutionPolicy Bypass -File scripts/package.ps1
# =============================================================================

$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent $PSScriptRoot
$DistDir = Join-Path $RootDir "dist"
$ManifestPath = Join-Path $RootDir "manifest.json"

if (-not (Test-Path $ManifestPath)) {
    throw "manifest.json not found at $ManifestPath"
}

$Manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json
$Version = $Manifest.version
$ZipPath = Join-Path $DistDir "world-clocks-extension-v$Version.zip"
$LatestZipPath = Join-Path $DistDir "world-clocks-extension.zip"

if (-not (Test-Path $DistDir)) {
    New-Item -ItemType Directory -Path $DistDir -Force | Out-Null
}

$LegacyStaging = Join-Path $DistDir "_staging"
if (Test-Path $LegacyStaging) {
    Remove-Item $LegacyStaging -Recurse -Force -ErrorAction SilentlyContinue
}

if (Test-Path $ZipPath) {
    Remove-Item $ZipPath -Force
}
if (Test-Path $LatestZipPath) {
    Remove-Item $LatestZipPath -Force
}

$PathsToZip = @(
    $ManifestPath,
    (Join-Path $RootDir "src"),
    (Join-Path $RootDir "assets")
)

Compress-Archive -Path $PathsToZip -DestinationPath $ZipPath -Force
Copy-Item $ZipPath -Destination $LatestZipPath -Force

Write-Host "Successfully packaged Chrome Web Store archive:" -ForegroundColor Green
Write-Host "  -> $LatestZipPath"
Write-Host "  -> $ZipPath"
