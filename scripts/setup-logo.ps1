# Script to copy Nova-XFinity logo to public directories
# Run this from the project root

$ErrorActionPreference = "Stop"

# Get the workspace directory (assuming script is run from project root)
$projectRoot = $PSScriptRoot | Split-Path -Parent
if (-not $projectRoot) {
    $projectRoot = Get-Location
}

Write-Host "Project root: $projectRoot" -ForegroundColor Cyan

# Source logo path
$logoSource = Join-Path $projectRoot "brand-identity\logo\NOVA — Crystal Core X Mark.png"

# Check if source exists
if (-not (Test-Path $logoSource)) {
    Write-Host "Error: Logo file not found at:" -ForegroundColor Red
    Write-Host "  $logoSource" -ForegroundColor Yellow
    Write-Host "`nPlease ensure the logo file exists in brand-identity/logo/" -ForegroundColor Yellow
    exit 1
}

Write-Host "Found logo at: $logoSource" -ForegroundColor Green

# Create public directories if they don't exist
$publicDirs = @(
    (Join-Path $projectRoot "public"),
    (Join-Path $projectRoot "frontend\public")
)

foreach ($dir in $publicDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Created directory: $dir" -ForegroundColor Yellow
    }
}

# Copy logo to both locations
$destinations = @(
    (Join-Path $projectRoot "public\nova-logo.png"),
    (Join-Path $projectRoot "frontend\public\nova-logo.png")
)

foreach ($dest in $destinations) {
    try {
        Copy-Item $logoSource -Destination $dest -Force
        Write-Host "✓ Copied logo to: $dest" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to copy to: $dest" -ForegroundColor Red
        Write-Host "  Error: $_" -ForegroundColor Red
    }
}

Write-Host "`nLogo setup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Restart your dev server" -ForegroundColor White
Write-Host "2. Refresh your browser (Ctrl+F5 for hard refresh)" -ForegroundColor White
Write-Host "3. Check the sidebar to verify the logo appears" -ForegroundColor White
