# Authentication System Integration

## Overview

The Finity AI SEO Article Writer uses a full-featured authentication system built with FastAPI (Python) backend and React frontend. The system includes JWT-based authentication with refresh tokens, OAuth2 social logins, email verification, and password reset functionality.

## Architecture

### Authentication Flow

```
User Login → FastAPI Backend validates → Generate JWT tokens → Return to client
                ↓
         Store tokens in cookies (access_token, refresh_token)
                ↓
    Client uses access token for API requests
                ↓
    Access token expires → Use refresh token → Get new access token
```

### Token Types

1. **Access Token**
   - Short-lived (30 minutes default, configurable)
   - Stored in cookies
   - Included in Authorization header as Bearer token
   - Contains user ID and email

2. **Refresh Token**
   - Long-lived (7 days default, configurable)
   - Stored in cookies
   - Used to get new access tokens
   - Can be revoked

## Backend Implementation

The authentication backend is built with FastAPI and located in `/backend-auth/`.

### Project Structure

```
backend-auth/
├── app/
│   ├── main.py                 # FastAPI application entry point
│   ├── core/
│   │   ├── config.py           # Settings and environment variables
│   │   ├── database.py         # Database connection and session
│   │   ├── security.py         # JWT and password hashing
│   │   └── init_admin_user.py  # Admin user initialization
│   ├── models/
│   │   ├── user.py             # User model
│   │   ├── oauth_connection.py # OAuth provider connections
│   │   └── token.py            # Email verification and reset tokens
│   ├── routes/
│   │   ├── auth.py             # Authentication endpoints
│   │   └── users.py            # User management endpoints
│   ├── schemas/
│   │   ├── auth.py             # Auth request/response schemas
│   │   └── user.py             # User schemas
│   └── services/
│       ├── email_service.py    # SMTP email sending
│       └── oauth_service.py    # OAuth provider integration
├── requirements.txt
└── Dockerfile
```

### JWT Configuration

JWT settings are configured in `app/core/config.py`:

```python
# JWT Configuration
JWT_SECRET_KEY: str  # Required - secret key for signing tokens
JWT_ALGORITHM: str = "HS256"
JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
```

### Authentication Endpoints

All authentication endpoints are prefixed with `/api/auth`:

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout (client-side token removal)
- `GET /api/auth/me` - Get current user info
- `GET /api/auth/social/{provider}` - Initiate OAuth login
- `GET /api/auth/social/{provider}/callback` - OAuth callback handler
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/verify-email` - Verify email address

### Admin User Creation

The admin user is automatically created on application startup using credentials from environment variables:

```python
ADMIN_EMAIL=ogcnewfinity@gmail.com
ADMIN_PASSWORD=FiniTy-2026-Data.CoM
```

The script `app/core/init_admin_user.py` runs on startup and creates an admin user if one doesn't exist.

## Frontend Integration

### Auth Context

The authentication context is located in `/context/AuthContext.js`:

```javascript
import { useAuth } from '../context/AuthContext';

// Usage in components
const { user, isAuthenticated, login, logout } = useAuth();
```

The AuthContext provides:
- `user` - Current user object
- `loading` - Loading state
- `isAuthenticated` - Boolean authentication status
- `login(email, password)` - Login function
- `register(userData)` - Registration function
- `logout()` - Logout function
- `updateUser(userData)` - Update user data
- `checkAuth()` - Check authentication status

### Auth Pages

Authentication pages are located in `/pages/auth/`:

- `Login.js` - Login page with email/password and social login buttons
- `Register.js` - Registration page with required terms checkbox
- `ForgotPassword.js` - Password reset request page
- `ResetPassword.js` - Password reset with token
- `VerifyEmail.js` - Email verification page

### Registration Form

The registration form includes a **required checkbox** that users must agree to:

> "By creating an account, you agree to our Privacy Policy, Terms of Service, and Return & Refund Policy."

This checkbox is validated on both frontend and backend. Registration will fail if the user doesn't agree to the terms.

### API Service

The API service (`/services/api.js`) automatically:
- Adds Bearer token to requests
- Handles token refresh on 401 errors
- Redirects to login on authentication failure

## Social Login Setup

The system supports OAuth2 login with three providers:

### Supported Providers

1. **Google OAuth**
2. **Discord OAuth**
3. **X (Twitter) OAuth**

### Setup Instructions

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:8000/api/auth/social/google/callback`
6. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env`

#### Discord OAuth

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Add redirect URI: `http://localhost:8000/api/auth/social/discord/callback`
4. Add `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` to `.env`

#### X (Twitter) OAuth

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app
3. Add callback URL: `http://localhost:8000/api/auth/social/twitter/callback`
4. Add `TWITTER_CLIENT_ID` and `TWITTER_CLIENT_SECRET` to `.env`

## Email Configuration

The system uses SMTP for sending emails. Configure SMTP settings in `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@finity.com
SMTP_FROM_NAME=Finity Auth
```

### Supported Email Services

- Gmail SMTP
- SendGrid
- Mailgun
- Any SMTP-compatible service

### Email Templates

The system automatically sends:

1. **Welcome Email** - Sent after registration with email verification link
2. **Password Reset Email** - Sent when user requests password reset

Email templates are HTML-formatted and include both HTML and plain text versions.

## Password Reset Flow

1. User requests password reset via `/forgot-password` page
2. Backend generates secure reset token (valid for 1 hour)
3. Email sent with reset link containing token
4. User clicks link and is redirected to `/reset-password?token=...`
5. User enters new password
6. Backend validates token and updates password

## Email Verification Flow

1. User registers account
2. Backend generates verification token (valid for 24 hours)
3. Welcome email sent with verification link
4. User clicks link and is redirected to `/verify-email?token=...`
5. Backend verifies token and marks email as verified

## Docker Setup

The authentication system is fully Dockerized. Use Docker Compose to run all services:

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# At minimum, set JWT_SECRET_KEY

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend-auth
```

### Services

- **PostgreSQL** - Database (port 5433)
- **Backend Auth** - FastAPI application (port 8000)
- **Frontend** - React application (runs separately or in Docker)

### Database Migrations

The database tables are automatically created on first startup. For production, consider using Alembic migrations:

```bash
cd backend-auth
alembic upgrade head
```

## Required Environment Variables

All credentials must be loaded from `.env`. Never hardcode passwords in code.

### Required Variables

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET_KEY` - Secret key for JWT tokens (required)

### Optional Variables

- `ADMIN_EMAIL` - Admin user email (default: ogcnewfinity@gmail.com)
- `ADMIN_PASSWORD` - Admin user password (default: FiniTy-2026-Data.CoM)
- OAuth client IDs and secrets (for social login)
- SMTP settings (for email functionality)

See `.env.example` for all available configuration options.

## Security Best Practices

1. **Password Hashing:** Uses bcrypt with secure salt rounds
2. **Token Expiration:** Short-lived access tokens (30 minutes default)
3. **HTTPS Only:** Use secure cookies in production
4. **Token Storage:** Tokens stored in httpOnly cookies (not localStorage)
5. **Token Rotation:** Refresh tokens are rotated on use
6. **Input Validation:** All inputs validated using Pydantic schemas
7. **SQL Injection Protection:** Uses SQLAlchemy ORM with parameterized queries

## API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## How to Register

1. Navigate to `/register` page
2. Fill in email, password, and optional username/full name
3. **Check the required checkbox** agreeing to Privacy Policy, Terms of Service, and Return & Refund Policy
4. Click "Create Account"
5. Check email for verification link
6. Click verification link to verify email
7. Login with your credentials

## How Admin is Created

The admin user is automatically created on application startup:

1. Backend reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from environment
2. Checks if admin user already exists
3. If not, creates admin user with:
   - `role=ADMIN`
   - `is_active=True`
   - `is_verified=True`
4. Logs success or error message

Admin creation happens in `backend-auth/app/core/init_admin_user.py` and runs on every application startup.

## Next Steps

- Review [Backend Architecture](../architecture/backend.md) for implementation details
- Check [Email Integration](email-autoresponders.md) for email templates
- See [API Documentation](../architecture/api.md) for endpoint details
