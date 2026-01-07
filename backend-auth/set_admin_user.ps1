# PowerShell script to create or update an admin user
# Usage: .\set_admin_user.ps1 user@example.com [password]

param(
    [Parameter(Mandatory=$true)]
    [string]$Email,
    [Parameter(Mandatory=$false)]
    [string]$Password
)

$ErrorActionPreference = "Stop"

Write-Host "Creating/updating admin user: $Email" -ForegroundColor Cyan

# Escape email for SQL (replace single quotes)
$escapedEmail = $Email -replace "'", "''"

if ($Password) {
    # Use the Python script to create/update with password
    # Properly escape the password argument
    Write-Host "Creating/updating admin user with password..." -ForegroundColor Cyan
    docker compose exec -T finity-backend python create_admin_user.py $Email $Password
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to create/update admin user" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Admin user created/updated successfully!" -ForegroundColor Green
} else {
    # Just update role if user exists
    Write-Host "Updating user role to admin..." -ForegroundColor Cyan
    $updateQuery = "UPDATE `"user`" SET role = 'admin', is_verified = true, is_active = true WHERE email = '$escapedEmail';"
    docker compose exec -T finity-db psql -U postgres -d finity_auth -c $updateQuery
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to update user role" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Verifying admin status..." -ForegroundColor Cyan
    $selectQuery = "SELECT email, role, is_verified, is_active FROM `"user`" WHERE email = '$escapedEmail';"
    docker compose exec -T finity-db psql -U postgres -d finity_auth -c $selectQuery
    
    Write-Host "Done! User $Email is now an admin." -ForegroundColor Green
}
