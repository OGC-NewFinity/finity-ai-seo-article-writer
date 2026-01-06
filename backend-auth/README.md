# Finity Auth Backend

FastAPI-based authentication backend for the Finity AI SEO Article Writer.

## Quick Start

### Using Docker (Recommended)

```bash
# From project root
docker-compose up -d backend-auth postgres
```

### Manual Setup

```bash
cd backend-auth

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp ../env.example .env
# Edit .env with your configuration

# Run the application
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Environment Variables

See `../env.example` for all required environment variables.

**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET_KEY` - Secret key for JWT tokens

**Optional:**
- `ADMIN_EMAIL` - Admin user email (default: ogcnewfinity@gmail.com)
- `ADMIN_PASSWORD` - Admin user password (default: FiniTy-2026-Data.CoM)
- OAuth client IDs/secrets for social login
- SMTP settings for email functionality

## API Endpoints

- **Authentication:**
  - `POST /api/auth/register` - Register new user
  - `POST /api/auth/login` - Login with email/password
  - `POST /api/auth/refresh` - Refresh access token
  - `POST /api/auth/logout` - Logout
  - `GET /api/auth/me` - Get current user
  - `GET /api/auth/social/{provider}` - Initiate OAuth login
  - `GET /api/auth/social/{provider}/callback` - OAuth callback
  - `POST /api/auth/forgot-password` - Request password reset
  - `POST /api/auth/reset-password` - Reset password
  - `POST /api/auth/verify-email` - Verify email address

- **User Management:**
  - `GET /api/users/me` - Get user profile
  - `PUT /api/users/me` - Update user profile
  - `DELETE /api/users/me` - Delete user account

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Admin User

The admin user is automatically created on startup using credentials from environment variables. The script runs in `app/core/init_admin_user.py`.

## Database

The database tables are automatically created on first startup. For production, consider using Alembic migrations.

## Testing

```bash
# Test the API
curl http://localhost:8000/health

# Register a user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "agreed_to_terms": true
  }'
```

## Project Structure

```
backend-auth/
├── app/
│   ├── main.py              # FastAPI app
│   ├── core/                 # Core configuration
│   ├── models/               # Database models
│   ├── routes/               # API routes
│   ├── schemas/              # Pydantic schemas
│   └── services/             # Business logic
├── requirements.txt
└── Dockerfile
```
