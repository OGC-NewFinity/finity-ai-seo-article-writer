# Finity Auth API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication

Most endpoints require authentication via JWT token. Include the token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "username": "johndoe",
  "full_name": "John Doe",
  "agreed_to_terms": true
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "johndoe",
  "full_name": "John Doe",
  "is_active": true,
  "is_verified": false,
  "role": "user",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

#### Forgot Password
```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Reset Password
```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_here",
  "new_password": "newsecurepassword123"
}
```

#### Verify Email
```http
POST /auth/verify-email?token=verification_token
```

#### Social Login Initiate
```http
GET /auth/social/{provider}
```

**Providers:** `google`, `discord`, `twitter`

**Response:**
```json
{
  "authorization_url": "https://accounts.google.com/o/oauth2/v2/auth?..."
}
```

#### Social Login Callback
```http
GET /auth/social/{provider}/callback?code=oauth_code
```

This endpoint redirects to the frontend with tokens.

### User Management

#### Get Current User
```http
GET /users/me
Authorization: Bearer <access_token>
```

#### Update User Profile
```http
PUT /users/me
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "email": "newemail@example.com",
  "username": "newusername",
  "full_name": "New Name"
}
```

#### Delete User Account
```http
DELETE /users/me
Authorization: Bearer <access_token>
```

## Error Responses

All errors follow this format:
```json
{
  "detail": "Error message here"
}
```

**Status Codes:**
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
