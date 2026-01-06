# PowerShell script to create or update an admin user
# Usage: .\set_admin_user.ps1 user@example.com [password]

param(
    [Parameter(Mandatory=$true)]
    [string]$Email,
    [Parameter(Mandatory=$false)]
    [string]$Password
)

Write-Host "Creating/updating admin user: $Email" -ForegroundColor Cyan

if ($Password) {
    # Use the Python script to create/update with password
    docker compose exec finity-backend python create_admin_user.py $Email "$Password"
} else {
    # Just update role if user exists
    Write-Host "Updating user role to admin..." -ForegroundColor Cyan
    docker compose exec finity-db psql -U postgres -d finity_auth -c "UPDATE `"user`" SET role = 'admin', is_verified = true, is_active = true WHERE email = '$Email';"
    
    Write-Host "Verifying admin status..." -ForegroundColor Cyan
    docker compose exec finity-db psql -U postgres -d finity_auth -c "SELECT email, role, is_verified, is_active FROM `"user`" WHERE email = '$Email';"
    
    Write-Host "Done! User $Email is now an admin." -ForegroundColor Green
}
