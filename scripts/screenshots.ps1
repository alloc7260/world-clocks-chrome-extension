# =============================================================================
# Render Chrome Web Store screenshots (1280x800 JPEG, no alpha) with headless Chrome/Edge.
# Usage: powershell -ExecutionPolicy Bypass -File scripts/screenshots.ps1
# =============================================================================

$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent $PSScriptRoot
$OutDir = Join-Path $RootDir "store-assets"
$Harness = Join-Path $OutDir "harness\screenshot.html"
$HarnessUrl = ([System.Uri]$Harness).AbsoluteUri

$Browser = @(
    "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $Browser) {
    throw "Chrome or Edge not found."
}

foreach ($Shot in 1, 2) {
    $Out = Join-Path $OutDir "screenshot-$Shot.jpeg"
    $Profile = Join-Path $env:TEMP "wc-shot-profile-$Shot"
    if (Test-Path $Profile) { Remove-Item $Profile -Recurse -Force }
    if (Test-Path $Out) { Remove-Item $Out -Force }

    $BrowserArgs = @(
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--force-device-scale-factor=1",
        "--allow-file-access-from-files",
        "--user-data-dir=`"$Profile`"",
        "--window-size=1280,800",
        "--virtual-time-budget=4000",
        "--screenshot=`"$Out`"",
        "`"$HarnessUrl`?shot=$Shot`""
    )
    Start-Process -FilePath $Browser -ArgumentList $BrowserArgs -Wait -NoNewWindow
    Remove-Item $Profile -Recurse -Force -ErrorAction SilentlyContinue

    if (-not (Test-Path $Out)) {
        throw "Screenshot $Shot was not created."
    }
    Write-Host "Created $Out"
}
