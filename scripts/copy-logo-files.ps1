# Script to copy Nova-XFinity logo files to required locations
# Run this script from the project root directory

$logoSource = "brand-identity\logo\NOVA — Crystal Core X Mark.png"

# Check if source logo exists
if (-not (Test-Path $logoSource)) {
    Write-Host "Error: Logo file not found at $logoSource" -ForegroundColor Red
    exit 1
}

Write-Host "Copying Nova-XFinity logo files..." -ForegroundColor Green

# Create directories if they don't exist
if (-not (Test-Path "public")) {
    New-Item -ItemType Directory -Path "public" | Out-Null
    Write-Host "Created public directory" -ForegroundColor Yellow
}

if (-not (Test-Path "wordpress-plugin\assets")) {
    New-Item -ItemType Directory -Path "wordpress-plugin\assets" | Out-Null
    Write-Host "Created wordpress-plugin\assets directory" -ForegroundColor Yellow
}

# Copy logo to public folder (for frontend)
Copy-Item $logoSource -Destination "public\nova-logo.png" -Force
Write-Host "✓ Copied logo to public\nova-logo.png" -ForegroundColor Green

# Copy logo as favicon (note: for proper .ico conversion, use an image tool)
Copy-Item $logoSource -Destination "public\favicon.ico" -Force
Write-Host "✓ Copied logo to public\favicon.ico" -ForegroundColor Green
Write-Host "  Note: For proper .ico format, convert using an image tool" -ForegroundColor Yellow

# Copy logo to WordPress plugin assets
Copy-Item $logoSource -Destination "wordpress-plugin\assets\nova-logo.png" -Force
Write-Host "✓ Copied logo to wordpress-plugin\assets\nova-logo.png" -ForegroundColor Green

Write-Host "`nLogo files copied successfully!" -ForegroundColor Green
Write-Host "`nOptional: Create optimized versions:" -ForegroundColor Yellow
Write-Host "  - nova-logo.svg (vector format)" -ForegroundColor Yellow
Write-Host "  - nova-logo-dark.png (dark theme variant)" -ForegroundColor Yellow
Write-Host "  - favicon.ico (proper ICO format, 16x16 or 32x32)" -ForegroundColor Yellow
