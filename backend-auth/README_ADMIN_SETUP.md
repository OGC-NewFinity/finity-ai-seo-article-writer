# Admin User Setup

## Quick Setup

To create or update an admin user, use the Python script:

```bash
# From project root
docker compose exec finity-backend python create_admin_user.py <email> <password>
```

**Example:**
```bash
docker compose exec finity-backend python create_admin_user.py admin@example.com mypassword123
```

## PowerShell Script (Windows)

```powershell
# Create/update admin with password
.\backend-auth\set_admin_user.ps1 ogcnewfinity@gmail.com "FiniTy-2026-Data.CoM"

# Or just update role (if user already exists)
.\backend-auth\set_admin_user.ps1 ogcnewfinity@gmail.com
```

## Bash Script (Linux/Mac)

```bash
# Create/update admin with password
docker compose exec finity-backend python create_admin_user.py ogcnewfinity@gmail.com "FiniTy-2026-Data.CoM"
```

## What the Script Does

1. **Checks if user exists** - If user exists, updates their role to 'admin'
2. **Creates new user** - If user doesn't exist, creates a new user with:
   - Email and password (properly hashed)
   - Role set to 'admin'
   - `is_verified = True` (no email verification needed)
   - `is_active = True` (user can login immediately)
3. **Updates password** - If user exists and password is provided, updates the password

## Default Admin Account

The default admin account is:
- **Email:** `ogcnewfinity@gmail.com`
- **Password:** `FiniTy-2026-Data.CoM`
- **Role:** `admin`
- **Status:** Verified and Active

## Manual Database Update

If you prefer to update via SQL directly:

```sql
-- Update existing user to admin
UPDATE "user" 
SET role = 'admin', is_verified = true, is_active = true 
WHERE email = 'ogcnewfinity@gmail.com';

-- Verify
SELECT email, role, is_verified, is_active FROM "user" WHERE email = 'ogcnewfinity@gmail.com';
```

Or via psql:
```bash
docker compose exec finity-db psql -U postgres -d finity_auth -c "UPDATE \"user\" SET role = 'admin', is_verified = true, is_active = true WHERE email = 'ogcnewfinity@gmail.com';"
```
