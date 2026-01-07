# Backend Architecture

## Overview

The backend is built with Node.js and Express.js, providing a RESTful API for the Nova‑XFinity AI Article Writer application. It handles authentication, article generation, media processing, and database operations.

## Directory Structure

```
backend/
├── src/
│   ├── index.js              # Entry point
│   ├── app.js                # Express app configuration
│   ├── config/               # Configuration files
│   │   ├── database.js       # Prisma client setup
│   │   ├── redis.js          # Redis client setup
│   │   └── env.js            # Environment validation
│   ├── routes/               # API routes
│   │   ├── auth.routes.js    # Authentication routes
│   │   ├── articles.routes.js
│   │   ├── media.routes.js
│   │   ├── research.routes.js
│   │   └── settings.routes.js
│   ├── controllers/          # Route handlers
│   │   ├── auth.controller.js
│   │   ├── articles.controller.js
│   │   ├── media.controller.js
│   │   └── research.controller.js
│   ├── services/             # Business logic
│   │   ├── auth.service.js
│   │   ├── ai.service.js     # Multi-provider AI service
│   │   ├── article.service.js
│   │   ├── media.service.js
│   │   ├── research.service.js
│   │   └── email.service.js
│   ├── models/               # Database models (Prisma)
│   │   └── schema.prisma
│   ├── middleware/           # Express middleware
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── validation.middleware.js
│   │   └── rateLimit.middleware.js
│   ├── utils/                # Helper functions
│   │   ├── encryption.js     # API key encryption
│   │   ├── validation.js     # Input validation
│   │   └── logger.js         # Logging utility
│   └── templates/            # Email templates
│       └── email/
│           ├── welcome.html
│           ├── verification.html
│           └── password-reset.html
├── tests/                    # Test files
├── migrations/               # Prisma migrations
├── docker-compose.yml        # Docker services
├── .env.example             # Environment variables template
└── package.json
```

## Core Components

### 1. Express Application (`app.js`)

```javascript
// Express app configuration
- CORS setup
- Body parsing (JSON, URL-encoded)
- Cookie parser
- Security headers
- Request logging
- Error handling middleware
- Route mounting
```

### 2. Authentication System

**JWT-based authentication:**
- Access tokens (short-lived, 15 minutes)
- Refresh tokens (long-lived, 7 days)
- Token refresh endpoint
- Password reset flow
- Email verification

**Security features:**
- Password hashing (bcrypt, 10 rounds)
- Rate limiting on auth endpoints
- Account lockout after failed attempts
- CSRF protection

### 3. API Services

#### AI Service
- Multi-provider support (Gemini, OpenAI, Claude, Llama)
- Automatic fallback mechanism
- Provider-specific optimizations
- Rate limit handling
- Cost tracking

#### Article Service
- Draft management
- Article generation orchestration
- Metadata extraction
- SEO optimization
- WordPress export formatting

#### Media Service
- Image generation (Gemini 2.5 Flash)
- Video generation (Veo 3.1)
- Audio generation (TTS)
- File storage and retrieval
- CDN integration

#### Research Service
- Google Search grounding integration
- Query caching
- Source citation tracking
- Research history

#### Email Service
- Welcome emails
- Verification emails
- Password reset
- Article notifications
- Autoresponder system

### 4. Database Layer (Prisma)

**Models:**
- User model with relationships
- Article model with versions
- Draft model
- MediaAsset model
- ResearchQuery model
- Settings model

**Features:**
- Connection pooling
- Query optimization
- Transaction support
- Migration system

### 5. Caching Layer (Redis)

**Cache strategies:**
- Article drafts (5 min TTL)
- Research results (1 hour TTL)
- User sessions
- API rate limit counters
- Frequently accessed settings

### 6. Middleware Stack

**Authentication Middleware:**
- JWT token validation
- User context injection
- Role-based access control

**Validation Middleware:**
- Request schema validation (Joi/Zod)
- Input sanitization
- File upload validation

**Error Handling Middleware:**
- Centralized error handling
- Error logging
- User-friendly error messages
- Error tracking (Sentry)

**Rate Limiting Middleware:**
- Per-IP rate limiting
- Per-user rate limiting
- Endpoint-specific limits

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Articles
- `GET /api/articles` - List user articles
- `GET /api/articles/:id` - Get article details
- `POST /api/articles` - Create new article
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article
- `POST /api/articles/:id/publish` - Publish to WordPress

### Drafts
- `GET /api/drafts` - List drafts
- `GET /api/drafts/:id` - Get draft
- `POST /api/drafts` - Save draft
- `PUT /api/drafts/:id` - Update draft
- `DELETE /api/drafts/:id` - Delete draft

### Media
- `POST /api/media/images` - Generate image
- `POST /api/media/videos` - Generate video
- `POST /api/media/audio` - Generate audio
- `GET /api/media/:id` - Get media asset

### Research
- `POST /api/research/query` - Execute research query
- `GET /api/research/history` - Get research history

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update settings
- `POST /api/settings/api-keys` - Store API keys

## Error Handling

**Error Response Format:**
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

**Error Codes:**
- `VALIDATION_ERROR` - Input validation failed
- `AUTHENTICATION_ERROR` - Authentication failed
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Rate limit exceeded
- `AI_PROVIDER_ERROR` - AI service error
- `INTERNAL_ERROR` - Server error

## Environment Configuration

**Required Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - Refresh token secret
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port
- `CORS_ORIGIN` - Allowed CORS origins
- `EMAIL_SERVICE` - Email provider (nodemailer/resend)
- `EMAIL_API_KEY` - Email service API key

## Testing Strategy

**Unit Tests:**
- Service layer tests
- Utility function tests
- Model tests

**Integration Tests:**
- API endpoint tests
- Database integration tests
- Authentication flow tests

**E2E Tests:**
- Complete user flows
- Article generation flow
- Media generation flow

## Performance Optimization

1. **Database:**
   - Indexed queries
   - Query optimization
   - Connection pooling
   - Read replicas (production)

2. **Caching:**
   - Redis for frequently accessed data
   - Response caching
   - Query result caching

3. **Async Processing:**
   - Queue system for long-running tasks
   - Background job processing
   - Email queue

## Security Best Practices

1. **Authentication:**
   - Secure password hashing
   - JWT token expiration
   - Refresh token rotation
   - Account lockout

2. **API Security:**
   - Rate limiting
   - Input validation
   - SQL injection prevention
   - XSS protection

3. **Data Security:**
   - Encrypted API keys
   - Secure environment variables
   - HTTPS only
   - CORS configuration

## Deployment

**Development:**
```bash
npm run dev
```

**Production:**
- Docker containerization
- Process manager (PM2)
- Load balancer (nginx)
- Environment variables via secrets manager

## Next Steps

- Review [Database Design](database.md) for schema details
- Review [API Documentation](api.md) for endpoint specifications
- Check [Setup Guide](../development/setup.md) for installation instructions
