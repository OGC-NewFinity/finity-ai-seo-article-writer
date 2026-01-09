# Nova-XFinity Logo Setup Guide

This document outlines the logo integration across the platform and provides instructions for setting up logo files.

## Logo Files Required

The main logo file is located at:
```
brand-identity/logo/NOVA — Crystal Core X Mark.png
```

## Required Logo Copies

### Frontend (`/public`)
1. **`/public/nova-logo.png`** - Main logo for frontend components
2. **`/public/favicon.ico`** - Browser tab icon (should be converted to proper ICO format)

### WordPress Plugin (`/wordpress-plugin/assets`)
1. **`/wordpress-plugin/assets/nova-logo.png`** - Logo for plugin admin interface

## Setup Instructions

### Option 1: Using the Provided Scripts

**Windows (Batch File - Recommended):**
```batch
.\scripts\copy-logo.bat
```

**Windows (PowerShell):**
```powershell
.\scripts\copy-logo-files.ps1
```

**Windows/Linux/Mac (Node.js):**
```bash
node scripts/setup-logo.js
```

**Linux/Mac (Bash):**
```bash
chmod +x scripts/copy-logo-files.sh
./scripts/copy-logo-files.sh
```

### Option 2: Manual Copy (If scripts don't work)

1. **Create directories** (if they don't exist):
   - `public/`
   - `frontend/public/`

2. **Copy the logo file**:
   ```
   brand-identity/logo/NOVA — Crystal Core X Mark.png 
     → public/nova-logo.png
     → frontend/public/nova-logo.png (optional)
   ```

3. **For WordPress plugin**:
   ```
   brand-identity/logo/NOVA — Crystal Core X Mark.png 
     → wordpress-plugin/assets/nova-logo.png
   ```

4. **For favicon** (optional):
   ```
   brand-identity/logo/NOVA — Crystal Core X Mark.png 
     → public/favicon.ico
   ```
   Note: For proper .ico format, convert using an online tool like [favicon.io](https://favicon.io)

## Logo Usage Locations

### Frontend
- ✅ **Sidebar** (`components/Sidebar.js`) - Main navigation logo
- ✅ **Loading Screen** (`components/common/Loading.js`) - Loading animation
- ✅ **Landing Page** (`pages/LandingPage/components/HeroSection.jsx`) - Hero section
- ✅ **Favicon** (`index.html`) - Browser tab icon
- ✅ **Meta Tags** (`index.html`) - Open Graph and Twitter card images

### WordPress Plugin
- ✅ **Wizard Header** (`wordpress-plugin/nova-xfinity-ai.php`) - Setup wizard logo
- ✅ **Settings Page** (`wordpress-plugin/nova-xfinity-ai.php`) - Settings page header

## Optional Optimizations

For better performance and compatibility, consider creating:

1. **SVG Version** (`nova-logo.svg`)
   - Vector format for scalability
   - Smaller file size
   - Better for high-DPI displays

2. **Dark Theme Variant** (`nova-logo-dark.png`)
   - Optimized for dark backgrounds
   - Better contrast

3. **Proper Favicon** (`favicon.ico`)
   - Convert PNG to ICO format
   - Recommended sizes: 16x16, 32x32, 48x48
   - Use online tools like [favicon.io](https://favicon.io) or [realfavicongenerator.net](https://realfavicongenerator.net)

## Alt Text

All logo images use the alt text: `"Nova‑XFinity AI Logo"` for accessibility.

## Verification Checklist

- [ ] Logo appears in sidebar navigation
- [ ] Logo appears in loading screen
- [ ] Logo appears on landing page
- [ ] Favicon displays in browser tab
- [ ] Open Graph image works (test with [Facebook Debugger](https://developers.facebook.com/tools/debug/))
- [ ] Twitter card image works (test with [Twitter Card Validator](https://cards-dev.twitter.com/validator))
- [ ] WordPress plugin wizard shows logo
- [ ] WordPress plugin settings page shows logo
- [ ] No 404 errors in browser console for logo files

## Troubleshooting

### Logo Not Displaying
1. Check that files exist in the correct locations
2. Verify file paths in code match actual file locations
3. Check browser console for 404 errors
4. Clear browser cache

### Favicon Not Updating
1. Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)
2. Clear browser cache
3. Verify favicon.ico exists in `/public` folder
4. Check that Vite is serving the public folder correctly

### WordPress Plugin Logo Not Showing
1. Verify logo file exists in `wordpress-plugin/assets/nova-logo.png`
2. Check file permissions
3. Clear WordPress cache if using caching plugins
4. Verify `NOVA_XFINITY_AI_PLUGIN_URL` constant is correct
