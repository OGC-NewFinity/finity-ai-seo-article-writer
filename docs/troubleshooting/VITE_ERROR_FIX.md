# Fixing Vite Error Overlay

If you're seeing a Vite error overlay, here are the most common causes and fixes:

## Common Issues

### 1. Missing Logo File (Most Likely)

**Error**: 404 for `/nova-logo.png` or image load error

**Fix**:
1. Copy the logo file:
   ```powershell
   .\scripts\copy-logo.bat
   ```
   
2. Or manually:
   - Copy `brand-identity/logo/NOVA — Crystal Core X Mark.png`
   - To `public/nova-logo.png`

3. Restart dev server:
   ```powershell
   # Stop (Ctrl+C)
   npm run dev
   ```

### 2. Vite Public Folder Not Found

**Error**: Assets not loading from `/public`

**Fix**: Ensure `public/` folder exists in project root:
```powershell
if (-not (Test-Path "public")) { New-Item -ItemType Directory -Path "public" }
```

### 3. Docker Volume Mount Issue

**Error**: File exists on host but not in container

**Fix**:
1. Verify volume mount in `docker-compose.yml`:
   ```yaml
   volumes:
     - .:/app
   ```

2. Restart frontend container:
   ```powershell
   docker compose restart finity-frontend
   ```

### 4. Browser Cache

**Error**: Old version cached

**Fix**: Hard refresh:
- Windows/Linux: `Ctrl + F5`
- Mac: `Cmd + Shift + R`

## Debugging Steps

1. **Check browser console** (F12):
   - Look for 404 errors
   - Check network tab for failed requests

2. **Verify file exists**:
   ```powershell
   Test-Path "public\nova-logo.png"
   ```

3. **Check Vite dev server logs**:
   - Look for file not found errors
   - Check if public folder is being served

4. **Test logo URL directly**:
   - Open: `http://localhost:3000/nova-logo.png`
   - Should display image (not 404)

## Temporary Workaround

If logo file doesn't exist yet, the Sidebar component has a fallback that shows the icon instead of crashing. The logo will appear once the file is copied.

## Still Having Issues?

1. Check the actual error message in the Vite overlay
2. Check browser console (F12) for detailed errors
3. Verify Docker containers are running: `docker ps`
4. Check Vite server logs in the terminal
