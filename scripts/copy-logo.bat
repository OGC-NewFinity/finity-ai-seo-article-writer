@echo off
REM Simple batch file to copy logo to public folder
REM Run this from the project root directory

echo Copying Nova-XFinity logo...

if not exist "public" mkdir public
if not exist "frontend\public" mkdir frontend\public

copy "brand-identity\logo\NOVA — Crystal Core X Mark.png" "public\nova-logo.png" /Y
copy "brand-identity\logo\NOVA — Crystal Core X Mark.png" "frontend\public\nova-logo.png" /Y

if exist "public\nova-logo.png" (
    echo ✓ Logo copied to public/nova-logo.png
) else (
    echo ✗ Failed to copy logo
)

if exist "frontend\public\nova-logo.png" (
    echo ✓ Logo copied to frontend/public/nova-logo.png
) else (
    echo ✗ Failed to copy logo to frontend/public
)

echo.
echo Logo setup complete!
echo.
echo Next steps:
echo 1. Restart your dev server (Ctrl+C, then: npm run dev)
echo 2. Refresh your browser (Ctrl+F5 for hard refresh)
echo 3. Check the sidebar to verify the logo appears

pause
