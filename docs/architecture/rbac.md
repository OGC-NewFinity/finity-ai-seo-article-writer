# Role-Based Access Control (RBAC) Implementation ✅

## Summary

A simple role-based access control system has been implemented with admin/user roles.

## Changes Made

### 1. ✅ Extended User Model
- **File**: `backend-auth/app/db.py`
- **Change**: Added `role` column to User model with default value `"user"`
- **Values**: `"user"` (default), `"admin"`

### 2. ✅ Updated Schemas
- **File**: `backend-auth/app/schemas.py`
- **Change**: Added `role` field to `UserRead` and `UserUpdate` schemas
- **Result**: `/users/me` endpoint now returns user's role

### 3. ✅ Created Admin Dependency
- **File**: `backend-auth/app/dependencies.py` (new)
- **Function**: `admin_required()` dependency
- **Behavior**: Returns 403 Forbidden if user role is not "admin"

### 4. ✅ Protected Admin Endpoint
- **File**: `backend-auth/app/app.py`
- **Endpoint**: `GET /admin/panel`
- **Protection**: Uses `admin_required` dependency
- **Response**: `{"message": "Welcome, Admin!", "user": "...", "role": "admin"}`

### 5. ✅ Frontend Admin UI
- **File**: `components/Dashboard.js`
- **Change**: Added admin welcome banner that displays when `user.role === 'admin'`
- **Display**: Shows "Welcome, Admin!" message with admin badge

### 6. ✅ Database Migration
- **File**: `backend-auth/migrations/add_role_column.py`
- **Purpose**: Adds `role` column to existing databases
- **Usage**: Run once to update existing user table

## Setup Instructions

### Step 1: Run Database Migration

For existing databases, run the migration:

```bash
docker-compose exec backend-auth python migrations/add_role_column.py
```

Or manually via SQL:
```sql
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'user' NOT NULL;
```

**Note**: New installations will automatically have the `role` column created by SQLAlchemy.

### Step 2: Set a User as Admin

After running the migration, set a user as admin:

```bash
docker-compose exec auth-db psql -U postgres -d finity_auth -c "UPDATE \"user\" SET role = 'admin' WHERE email = 'your-admin-email@example.com';"
```

Or via SQL directly:
```sql
UPDATE "user" SET role = 'admin' WHERE email = 'admin@example.com';
```

### Step 3: Restart Backend

```bash
docker-compose restart backend-auth
```

## Testing

### 1. Register Two Accounts
- Register user1@example.com
- Register user2@example.com

### 2. Set One User as Admin
```sql
UPDATE "user" SET role = 'admin' WHERE email = 'user1@example.com';
```

### 3. Test Admin Endpoint

**As Admin User:**
```bash
# Login as admin user and get token
curl -X POST "http://localhost:8000/auth/jwt/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user1@example.com&password=yourpassword"

# Access admin panel (should work)
curl -X GET "http://localhost:8000/admin/panel" \
  -H "Authorization: Bearer YOUR_TOKEN"
# Response: {"message": "Welcome, Admin!", "user": "user1@example.com", "role": "admin"}
```

**As Regular User:**
```bash
# Login as regular user and get token
curl -X POST "http://localhost:8000/auth/jwt/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user2@example.com&password=yourpassword"

# Try to access admin panel (should fail)
curl -X GET "http://localhost:8000/admin/panel" \
  -H "Authorization: Bearer YOUR_TOKEN"
# Response: {"detail": "Admin access required"} (403 Forbidden)
```

### 4. Test Frontend

1. Login as admin user → Dashboard should show "Welcome, Admin!" banner
2. Login as regular user → Dashboard should NOT show admin banner
3. Check `/users/me` endpoint → Should return `{"role": "admin"}` or `{"role": "user"}`

## API Endpoints

### Get Current User (includes role)
```
GET /users/me
Authorization: Bearer <token>
Response: {
  "id": "...",
  "email": "...",
  "is_active": true,
  "is_verified": true,
  "role": "admin" | "user"
}
```

### Admin Panel (Admin Only)
```
GET /admin/panel
Authorization: Bearer <token>
Response (Admin): {
  "message": "Welcome, Admin!",
  "user": "admin@example.com",
  "role": "admin"
}
Response (Non-Admin): 403 Forbidden
```

## Code Structure

```
backend-auth/
├── app/
│   ├── db.py              # User model with role column
│   ├── schemas.py         # UserRead/UserUpdate with role field
│   ├── dependencies.py    # admin_required dependency
│   ├── app.py             # Admin endpoint
│   └── users.py           # UserManager (unchanged)
├── migrations/
│   ├── add_role_column.py # Migration script
│   └── README.md          # Migration instructions
└── ...

components/
└── Dashboard.js           # Admin UI banner
```

## Security Notes

- ✅ Role is stored in database (not in JWT token)
- ✅ Admin check happens server-side via dependency
- ✅ Frontend UI is cosmetic only (server enforces access)
- ✅ 403 Forbidden returned for unauthorized access
- ✅ Role defaults to "user" for new registrations

## Future Enhancements

Possible improvements (not implemented):
- More roles (e.g., "moderator", "editor")
- Role-based permissions (granular permissions per role)
- Admin panel UI with user management
- Role assignment via API (admin-only endpoint)

## Files Modified

- ✅ `backend-auth/app/db.py` - Added role column
- ✅ `backend-auth/app/schemas.py` - Added role to schemas
- ✅ `backend-auth/app/dependencies.py` - New admin dependency
- ✅ `backend-auth/app/app.py` - Added admin endpoint
- ✅ `components/Dashboard.js` - Added admin UI
- ✅ `backend-auth/migrations/add_role_column.py` - Migration script

## Status

✅ **Backend**: Role column added, admin dependency created  
✅ **API**: Admin endpoint protected and working  
✅ **Frontend**: Admin UI displays for admin users  
✅ **Migration**: Script ready for existing databases  
⏳ **Action Required**: Run migration and set admin user
