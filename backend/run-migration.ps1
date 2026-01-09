# Script to run Prisma migration for GenerationFailure model
# Run this script from the backend directory

Write-Host "Running Prisma migration to add GenerationFailure model..." -ForegroundColor Cyan

# Check if we're in the backend directory
if (-not (Test-Path "prisma\schema.prisma")) {
    Write-Host "Error: prisma\schema.prisma not found. Please run this script from the backend directory." -ForegroundColor Red
    exit 1
}

# Check if Prisma is installed
if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
    Write-Host "Error: npx not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Run the migration
Write-Host "`nCreating migration..." -ForegroundColor Yellow
npx prisma migrate dev --name add_generation_failures

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Migration completed successfully!" -ForegroundColor Green
    Write-Host "The 'generation_failures' table has been created in your database." -ForegroundColor Green
} else {
    Write-Host "`n❌ Migration failed. Please check the error messages above." -ForegroundColor Red
    exit 1
}
