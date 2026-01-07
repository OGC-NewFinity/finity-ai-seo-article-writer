# PowerShell script to setup .env file from env.example
# Usage: .\scripts\setup-env.ps1

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$envExamplePath = Join-Path $projectRoot "env.example"
$envPath = Join-Path $projectRoot ".env"

Write-Host "🔧 Setting up .env file...`n" -ForegroundColor Cyan

# Read template
if (-not (Test-Path $envExamplePath)) {
    Write-Host "❌ Error: $envExamplePath not found!" -ForegroundColor Red
    exit 1
}

$template = Get-Content $envExamplePath -Raw

# Read existing .env if it exists
$existingEnv = @{}
if (Test-Path $envPath) {
    Write-Host "📖 Reading existing .env file..." -ForegroundColor Yellow
    $existingLines = Get-Content $envPath
    foreach ($line in $existingLines) {
        $trimmed = $line.Trim()
        if ($trimmed -and -not $trimmed.StartsWith("#") -and $trimmed -match "^([^=:#]+)=(.*)$") {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim() -replace "^['`"]|['`"]$", ""
            $existingEnv[$key] = $value
        }
    }
    Write-Host "   Found $($existingEnv.Keys.Count) existing keys`n" -ForegroundColor Yellow
} else {
    Write-Host "📝 Creating new .env file from template...`n" -ForegroundColor Yellow
}

# Required keys
$requiredKeys = @(
    "DATABASE_URL",
    "SECRET",
    "USERS_VERIFICATION_TOKEN_SECRET",
    "USERS_RESET_PASSWORD_TOKEN_SECRET",
    "BACKEND_CORS_ORIGINS",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD",
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USERNAME",
    "SMTP_PASSWORD",
    "EMAILS_FROM_EMAIL",
    "EMAILS_ENABLED",
    "FRONTEND_URL",
    "VITE_API_URL"
)

# Parse template and merge with existing
$outputLines = @()
$templateLines = $template -split "`r?`n"
$usedKeys = New-Object System.Collections.Generic.HashSet[string]

foreach ($line in $templateLines) {
    $trimmed = $line.Trim()
    
    # Preserve empty lines and comments
    if (-not $trimmed -or $trimmed.StartsWith("#")) {
        $outputLines += $line
        continue
    }
    
    if ($trimmed -match "^([^=:#]+)=(.*)$") {
        $key = $matches[1].Trim()
        $usedKeys.Add($key) | Out-Null
        
        # Use existing value if present, otherwise use template value, otherwise __REQUIRED__
        $value = $existingEnv[$key]
        if (-not $value -or $value -eq "") {
            $templateValue = ($matches[2].Trim() -replace "^['`"]|['`"]$", "")
            if (-not $templateValue -or $templateValue -eq "") {
                if ($requiredKeys -contains $key) {
                    $value = "__REQUIRED__"
                } else {
                    $value = ""
                }
            } else {
                $value = $templateValue
            }
        }
        
        $outputLines += "$key=$value"
    }
}

# Add any additional keys from existing env that aren't in template
foreach ($key in $existingEnv.Keys) {
    if (-not $usedKeys.Contains($key)) {
        $outputLines += "$key=$($existingEnv[$key])"
    }
}

# Write merged .env file
$output = $outputLines -join "`n" + "`n"
[System.IO.File]::WriteAllText($envPath, $output, [System.Text.Encoding]::UTF8)

Write-Host "✅ .env file updated successfully!`n" -ForegroundColor Green

# Check for missing required values
$missingRequired = @()
$finalEnv = @{}
$outputLines | ForEach-Object {
    if ($_ -match "^([^=:#]+)=(.*)$") {
        $finalEnv[$matches[1].Trim()] = ($matches[2].Trim() -replace "^['`"]|['`"]$", "")
    }
}

foreach ($key in $requiredKeys) {
    $value = $finalEnv[$key]
    if (-not $value -or $value -eq "" -or $value -eq "__REQUIRED__") {
        $missingRequired += $key
    }
}

if ($missingRequired.Count -gt 0) {
    Write-Host "⚠️  The following required keys need to be set:" -ForegroundColor Yellow
    foreach ($key in $missingRequired) {
        Write-Host "   - $key" -ForegroundColor Yellow
    }
    Write-Host "`n📝 Please edit .env and replace __REQUIRED__ with actual values.`n" -ForegroundColor Yellow
} else {
    Write-Host "✅ All required keys have values set!`n" -ForegroundColor Green
}