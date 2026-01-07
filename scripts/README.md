# Setup Scripts

This directory contains cross-platform scripts for setting up the development environment.

## Environment Setup

### Option 1: Node.js (Cross-platform)
```bash
npm run setup:env
```

### Option 2: PowerShell (Windows)
```powershell
npm run setup:env:ps1
# Or directly:
.\scripts\setup-env.ps1
```

### Option 3: Bash (Linux/macOS)
```bash
npm run setup:env:sh
# Or directly:
chmod +x scripts/setup-env.sh
./scripts/setup-env.sh
```

## What the scripts do

1. Reads `env.example` as a template
2. Checks if `.env` already exists
3. Merges existing values with template
4. Sets missing required keys to `__REQUIRED__`
5. Preserves all existing values

## Required Environment Variables

After running the setup script, make sure to replace `__REQUIRED__` with actual values for:

- `SECRET` - JWT secret key (generate with: `openssl rand -hex 32`)
- `USERS_VERIFICATION_TOKEN_SECRET` - Email verification token secret
- `USERS_RESET_PASSWORD_TOKEN_SECRET` - Password reset token secret
- `ADMIN_EMAIL` - Initial admin user email
- `ADMIN_PASSWORD` - Initial admin user password
- `SMTP_HOST` - SMTP server hostname
- `SMTP_USERNAME` - SMTP username
- `SMTP_PASSWORD` - SMTP password
- `EMAILS_FROM_EMAIL` - From email address

## Notes

- All scripts preserve existing `.env` values
- Missing required keys are set to `__REQUIRED__` for easy identification
- Optional keys (OAuth, PayPal) can be left empty if not needed