#!/bin/bash
# Script to copy Nova-XFinity logo files to required locations
# Run this script from the project root directory

LOGO_SOURCE="brand-identity/logo/NOVA — Crystal Core X Mark.png"

# Check if source logo exists
if [ ! -f "$LOGO_SOURCE" ]; then
    echo "Error: Logo file not found at $LOGO_SOURCE"
    exit 1
fi

echo "Copying Nova-XFinity logo files..."

# Create directories if they don't exist
mkdir -p public
mkdir -p wordpress-plugin/assets

# Copy logo to public folder (for frontend)
cp "$LOGO_SOURCE" "public/nova-logo.png"
echo "✓ Copied logo to public/nova-logo.png"

# Copy logo as favicon (note: for proper .ico conversion, use an image tool)
cp "$LOGO_SOURCE" "public/favicon.ico"
echo "✓ Copied logo to public/favicon.ico"
echo "  Note: For proper .ico format, convert using an image tool"

# Copy logo to WordPress plugin assets
cp "$LOGO_SOURCE" "wordpress-plugin/assets/nova-logo.png"
echo "✓ Copied logo to wordpress-plugin/assets/nova-logo.png"

echo ""
echo "Logo files copied successfully!"
echo ""
echo "Optional: Create optimized versions:"
echo "  - nova-logo.svg (vector format)"
echo "  - nova-logo-dark.png (dark theme variant)"
echo "  - favicon.ico (proper ICO format, 16x16 or 32x32)"
