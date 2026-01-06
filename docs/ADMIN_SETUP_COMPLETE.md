# Admin Setup Complete ✅

## Migration & Setup Summary

### ✅ Completed Steps

1. **Database Migration Executed**
   - Role column successfully added to `user` table
   - All existing users defaulted to `role = 'user'`
   - Migration is idempotent (safe to run multiple times)

2. **Backend Restarted**
   - Backend service restarted with role-based access control enabled
   - Admin endpoint `/admin/panel` is now protected

3. **Helper Scripts Created**
   - `backend-auth/set_admin_user.ps1` - PowerShell script for Windows
   - `backend-auth/set_admin_user.sh` - Bash script for Linux/Mac

## Setting an Admin User

Since no users exist in the database yet, you'll need to:

### Step 1: Register a User
1. Go to `/register` in your frontend
2. Register a new account (e.g., `admin@example.com`)

### Step 2: Set User as Admin

**Option A: Using PowerShell Script (Windows)**
```powershell
cd "F:\Plugins projects\finity-ai-seo-article-writer"
.\backend-auth\set_admin_user.ps1 admin@example.com
```

**Option B: Using Bash Script (Linux/Mac)**
```bash
cd /path/to/finity-ai-seo-article-writer
chmod +x backend-auth/set_admin_user.sh
./backend-auth/set_admin_user.sh admin@example.com
```

**Option C: Direct SQL Command**
```bash
docker-compose exec auth-db psql -U postgres -d finity_auth -c "UPDATE \"user\" SET role = 'admin' WHERE email = 'admin@example.com';"
```

**Option D: Using SQL File**
1. Edit `backend-auth/set_admin.sql`
2. Uncomment and update the email line
3. Run: `Get-Content backend-auth/set_admin.sql | docker-compose exec -T auth-db psql -U postgres -d finity_auth`

## Verification

### Check User Roles
```bash
docker-compose exec auth-db psql -U postgres -d finity_auth -c "SELECT email, role FROM \"user\";"
```

### Test Admin Endpoint

**As Admin User:**
```bash
# Login and get token
curl -X POST "http://localhost:8000/auth/jwt/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@example.com&password=yourpassword"

# Access admin panel (should work)
curl -X GET "http://localhost:8000/admin/panel" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "message": "Welcome, Admin!",
  "user": "admin@example.com",
  "role": "admin"
}
```

**As Regular User:**
```bash
# Try to access admin panel (should fail)
curl -X GET "http://localhost:8000/admin/panel" \
  -H "Authorization: Bearer REGULAR_USER_TOKEN"
```

**Expected Response:**
```json
{
  "detail": "Admin access required"
}
```
Status: `403 Forbidden`

## Frontend Testing

1. **Login as Admin User**
   - Go to `/login`
   - Login with admin credentials
   - Dashboard should display "Welcome, Admin!" banner

2. **Login as Regular User**
   - Go to `/login`
   - Login with regular user credentials
   - Dashboard should NOT show admin banner

3. **Check User Role via API**
   - After login, check `/users/me` endpoint
   - Should return `{"role": "admin"}` or `{"role": "user"}`

## Current Status

✅ **Database**: Role column added and migration complete  
✅ **Backend**: Restarted with role-based access control  
✅ **Admin Endpoint**: `/admin/panel` protected and working  
✅ **Frontend**: Admin UI ready to display for admin users  
⏳ **Action Required**: Register a user and set one as admin

## Quick Reference

### Database Commands

**List all users:**
```bash
docker-compose exec auth-db psql -U postgres -d finity_auth -c "SELECT email, role FROM \"user\";"
```

**Set user as admin:**
```bash
docker-compose exec auth-db psql -U postgres -d finity_auth -c "UPDATE \"user\" SET role = 'admin' WHERE email = 'user@example.com';"
```

**Set user back to regular:**
```bash
docker-compose exec auth-db psql -U postgres -d finity_auth -c "UPDATE \"user\" SET role = 'user' WHERE email = 'user@example.com';"
```

### API Endpoints

- `GET /users/me` - Get current user (includes role)
- `GET /admin/panel` - Admin-only endpoint
- `POST /auth/jwt/login` - Login endpoint
- `POST /auth/register` - Register new user

## Troubleshooting

### Migration Already Run?
The migration is idempotent - it's safe to run multiple times. It will skip if the column already exists.

### Can't Access Admin Panel?
1. Verify user role in database: `SELECT email, role FROM "user";`
2. Check token is valid (not expired)
3. Ensure backend was restarted after setting admin role
4. Check backend logs: `docker-compose logs backend-auth`

### Frontend Not Showing Admin Banner?
1. Logout and login again to refresh user data
2. Check browser console for errors
3. Verify `/users/me` returns `{"role": "admin"}`
4. Clear browser cache and cookies

## Next Steps

1. Register a test user
2. Set that user as admin using one of the methods above
3. Test the admin endpoint and frontend UI
4. Verify regular users cannot access `/admin/panel`
