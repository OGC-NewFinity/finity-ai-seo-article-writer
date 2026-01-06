# Database Migrations

## Add Role Column Migration

This migration adds the `role` column to the `user` table for role-based access control.

### Running the Migration

**Option 1: Run inside Docker container**
```bash
docker-compose exec backend-auth python migrations/add_role_column.py
```

**Option 2: Run locally (if you have direct DB access)**
```bash
cd backend-auth
python migrations/add_role_column.py
```

### What it does

- Checks if the `role` column already exists
- Adds the `role` column with default value `'user'` if it doesn't exist
- Sets all existing users to `role='user'` by default

### Manual Database Update

If you prefer to run SQL directly:

```sql
-- Add role column if it doesn't exist
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'user' NOT NULL;

-- Update existing users to have 'user' role (if any are NULL)
UPDATE "user" SET role = 'user' WHERE role IS NULL;

-- Set a user as admin (example)
UPDATE "user" SET role = 'admin' WHERE email = 'admin@example.com';
```

### Setting a User as Admin

After running the migration, you can set a user as admin using SQL:

```sql
UPDATE "user" SET role = 'admin' WHERE email = 'your-admin-email@example.com';
```

Or via psql:
```bash
docker-compose exec auth-db psql -U postgres -d finity_auth -c "UPDATE \"user\" SET role = 'admin' WHERE email = 'admin@example.com';"
```
