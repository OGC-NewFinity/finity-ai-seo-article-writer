# System Architecture Overview

## Introduction

Nova‑XFinity AI Article Writer is a full-stack application that generates SEO-optimized WordPress articles using multiple AI providers. The system is designed with a modular, scalable architecture supporting both frontend and backend components.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   React UI   │  │   Auth UI    │  │   Writer UI  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express.js Backend                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   REST API   │  │   Auth JWT   │  │   Services   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ PostgreSQL   │      │    Redis     │      │  AI Services │
│  Database    │      │    Cache     │      │  (Multi-prov)│
└──────────────┘      └──────────────┘      └──────────────┘
```

## Technology Stack

### Frontend
- **Framework:** React 19.0.0 with HTM (HTML-in-JS)
- **Build Tool:** Vite 6.2.0
- **Styling:** Tailwind CSS (CDN)
- **State Management:** React Context API / Zustand (planned)
- **Icons:** Font Awesome 6.4.0

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Joi or Zod

### Database
- **Primary DB:** PostgreSQL (via Docker)
- **Cache:** Redis (via Docker)
- **Migrations:** Prisma Migrate

### AI Providers
- **Primary:** Google Gemini (with native context)
- **Alternatives:** OpenAI (GPT-4o), Anthropic (Claude), Groq (Llama)
- **Fallback:** Automatic provider switching

### Infrastructure
- **Containerization:** Docker & Docker Compose
- **Email:** Nodemailer / Resend
- **Queue:** Bull/BullMQ for async tasks

## Architecture Principles

### 1. Modular Design
- Feature-based code organization
- Separation of concerns (presentation, business logic, data)
- Reusable components and services

### 2. Scalability
- Stateless API design
- Horizontal scaling support
- Caching strategies (Redis)
- Async task processing (queues)

### 3. Security
- JWT-based authentication
- Encrypted API key storage
- Rate limiting
- CORS configuration
- Input validation and sanitization

### 4. Developer Experience
- TypeScript support (frontend)
- Comprehensive documentation
- Hot module replacement (Vite)
- Environment-based configuration

## Data Flow

### Article Generation Flow

```
User Input → Frontend → API Request → Backend Service
                                          │
                                          ├─→ Database (save draft)
                                          ├─→ AI Provider (generate)
                                          └─→ Cache (store results)
                                                      │
Response ← Frontend ← API Response ← Backend ←───────┘
```

### Authentication Flow

```
Login → Frontend → POST /api/auth/login → Backend
                                              │
                                              ├─→ Validate Credentials
                                              ├─→ Generate JWT
                                              └─→ Store Session
                                                      │
Token ← Frontend ← JWT Token ← Backend ←────────────┘
```

## System Components

### Frontend Components
1. **Writer Module** - Article generation interface
2. **Research Module** - Research intelligence lab
3. **MediaHub Module** - Media generation (images/videos)
4. **Dashboard** - Overview and statistics
5. **Settings** - Configuration management
6. **Authentication** - Login/Register/Password reset

### Backend Services
1. **Auth Service** - User authentication and authorization
2. **Article Service** - Article generation and management
3. **AI Service** - Multi-provider AI integration
4. **Media Service** - Image/video generation
5. **Research Service** - Web research integration
6. **Email Service** - Email notifications and autoresponders

### Database Schema
- **users** - User accounts and profiles
- **articles** - Generated articles
- **drafts** - Article drafts
- **api_keys** - Encrypted user API keys
- **media_assets** - Generated media files
- **research_queries** - Research history
- **settings** - User preferences

## Deployment Architecture

### Development
- Local PostgreSQL (Docker)
- Local Redis (Docker)
- Vite dev server (HMR enabled)
- Express dev server (nodemon)

### Production
- Frontend: Static build (Vite) → CDN/Static hosting
- Backend: Express server → Node.js hosting (PM2/Docker)
- Database: Managed PostgreSQL
- Cache: Managed Redis
- Files: Object storage (S3-compatible)

## Security Considerations

1. **API Security**
   - JWT token expiration
   - Refresh token rotation
   - Rate limiting per user/IP
   - Input sanitization

2. **Data Security**
   - Encrypted API keys at rest
   - Password hashing (bcrypt)
   - SQL injection prevention (Prisma)
   - XSS protection

3. **Infrastructure Security**
   - HTTPS only
   - Environment variable secrets
   - Docker network isolation
   - Regular dependency updates

## Performance Optimization

1. **Frontend**
   - Code splitting
   - Lazy loading
   - Image optimization
   - Memoization

2. **Backend**
   - Response caching (Redis)
   - Database query optimization
   - Connection pooling
   - Async processing (queues)

3. **Database**
   - Indexed queries
   - Connection pooling
   - Query optimization
   - Regular backups

## Monitoring & Logging

- Application logging (Winston/Pino)
- Error tracking (Sentry)
- Performance monitoring
- Database query logging
- API request/response logging

## Next Steps

- Review [Backend Architecture](backend.md) for detailed backend structure
- Review [Database Design](database.md) for schema details
- Review [Frontend Architecture](frontend.md) for component structure
- Review [API Documentation](api.md) for endpoint specifications
