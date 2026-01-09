# Logo Setup for Docker Environment

Since you're running the application in Docker, here's how to set up the logo file:

## Quick Setup

### Option 1: Copy Before Starting Docker (Recommended)

1. **Copy the logo file** to the `public` folder on your host machine:
   ```powershell
   # From project root
   .\scripts\copy-logo.bat
   ```
   
   Or manually:
   - Copy `brand-identity/logo/NOVA — Crystal Core X Mark.png`
   - To `public/nova-logo.png`

2. **Restart Docker containers**:
   ```powershell
   # Stop current containers (Ctrl+C)
   npm run dev
   ```

3. **Hard refresh browser**: `Ctrl + F5`

### Option 2: Copy Into Running Container

If the logo wasn't copied before starting Docker:

1. **Copy logo to public folder** (on host):
   ```powershell
   .\scripts\copy-logo.bat
   ```

2. **The frontend container uses a volume mount**, so the file should appear automatically. If not, restart:
   ```powershell
   docker compose restart finity-frontend
   ```

## Docker Volume Mount

Looking at `docker-compose.yml`, the frontend service has:
```yaml
volumes:
  - .:/app
  - /app/node_modules
```

This means:
- ✅ Files in `public/` on your host are accessible in the container
- ✅ Changes to files are reflected immediately (no rebuild needed)
- ✅ The logo at `public/nova-logo.png` will be served by Vite

## Verification

1. Check if logo file exists:
   ```powershell
   Test-Path "public\nova-logo.png"
   ```

2. Check in browser:
   - Open: `http://localhost:3000/nova-logo.png`
   - Should display the logo image (not 404)

3. Check sidebar:
   - Logo should appear in the left sidebar
   - If not, hard refresh: `Ctrl + F5`

## Troubleshooting

### Logo Not Showing
1. **Verify file exists**: `Test-Path "public\nova-logo.png"`
2. **Check browser console**: Look for 404 errors
3. **Restart frontend container**: `docker compose restart finity-frontend`
4. **Clear browser cache**: Hard refresh (`Ctrl + F5`)

### Docker Volume Issues
If the file doesn't appear in the container:
1. Check Docker volume mount is working
2. Verify file permissions
3. Restart the frontend container

## Note on Backend Error

The `finity-backend-node` container error about Resend API key has been fixed. The email service now handles missing API keys gracefully. If you want to enable email functionality:

1. Get a Resend API key from https://resend.com/api-keys
2. Add to your `.env` file:
   ```
   EMAIL_API_KEY=re_your_key_here
   ```
3. Restart containers: `npm run dev`

The application will work without the Resend API key - emails just won't be sent.
