# Admin User Initialization

## Overview

The admin user initialization script (`init_admin_user.py`) automatically creates an admin user on application startup if one doesn't already exist.

## Configuration

Add the following to your `.env` file:

```env
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=your-secure-password
```

## Behavior

- **On Startup**: The script runs automatically when the FastAPI application starts
- **If admin exists**: Logs "✅ Admin user already exists."
- **If admin created**: Logs "✅ Admin user created successfully."
- **If credentials missing**: Logs a warning and skips creation
- **If error occurs**: Logs the error and raises an exception

## Admin User Properties

- **Role**: `admin`
- **Status**: `is_active=True`, `is_verified=True`
- **Password**: Hashed using bcrypt (72-byte limit)
- **Full Name**: "System Administrator" (can be updated later)

## Security Notes

- Password is hashed using bcrypt before storage
- Passwords longer than 72 bytes are automatically truncated
- Only one admin user is created (prevents duplicates)
- If email already exists as a non-admin user, admin creation is skipped

## Manual Admin Creation

If you need to manually create or regenerate an admin user:

1. Stop the application
2. Update `.env` with new credentials
3. Delete the existing admin user from the database (if needed)
4. Restart the application

## CLI Command (Future Enhancement)

A CLI command can be added to regenerate admin users:

```bash
python -m app.core.init_admin_user --email new@admin.com --password newpass
```
