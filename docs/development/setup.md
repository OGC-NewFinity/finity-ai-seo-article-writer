# Development Environment Setup

**Description:** Comprehensive guide for setting up the development environment, including prerequisites, installation steps, configuration, and troubleshooting.  
**Last Updated:** 2026-01-07  
**Status:** Stable

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Install Frontend Dependencies](#2-install-frontend-dependencies)
  - [3. Setup Environment Variables](#3-setup-environment-variables)
  - [4. Setup Backend (if using backend)](#4-setup-backend-if-using-backend)
  - [5. Start Docker Services](#5-start-docker-services)
  - [6. Run Database Migrations](#6-run-database-migrations)
  - [7. Start Development Servers](#7-start-development-servers)
- [Detailed Setup](#detailed-setup)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
  - [Docker Setup](#docker-setup)
- [IDE Setup](#ide-setup)
  - [VS Code Extensions](#vs-code-extensions)
  - [VS Code Settings](#vs-code-settings)
- [API Keys Setup](#api-keys-setup)
  - [Google Gemini API Key](#google-gemini-api-key)
  - [OpenAI API Key (Optional)](#openai-api-key-optional)
  - [Anthropic Claude API Key (Optional)](#anthropic-claude-api-key-optional)
- [Database Access](#database-access)
  - [Using Prisma Studio](#using-prisma-studio)
  - [Using pgAdmin](#using-pgadmin)
  - [Using psql Command Line](#using-psql-command-line)
- [Testing Setup](#testing-setup)
  - [Frontend Tests](#frontend-tests)
  - [Backend Tests](#backend-tests)
- [Troubleshooting](#troubleshooting)
  - [Port Already in Use](#port-already-in-use)
  - [Docker Issues](#docker-issues)
  - [Database Connection Issues](#database-connection-issues)
  - [Prisma Issues](#prisma-issues)
- [Environment Variables Reference](#environment-variables-reference)
  - [Frontend (.env.local)](#frontend-envlocal)
  - [Backend (.env)](#backend-env)
- [Access Points](#access-points)
- [Testing Locally](#testing-locally)
- [Next Steps](#next-steps)

---

## Prerequisites

Before setting up the development environment, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
- **Git** - [Download](https://git-scm.com/)

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/nova-xfinity-ai.git
cd nova-xfinity-ai
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create `.env.local` file in the root directory:

```env
# Frontend Environment Variables
VITE_API_URL=http://localhost:3001/api
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Setup Backend (if using backend)

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
```

### 5. Start Docker Services

**Option A: Using Docker Compose (Recommended)**
```bash
# Start all services with one command
npm run dev
# This runs docker compose up --build using root-level docker-compose.yml
```

**Option B: Manual Docker Services**
```bash
# Start PostgreSQL and Redis only
docker-compose up -d
```

**Services Started:**
- PostgreSQL (port `5432`)
- Node.js API (port `3001`)
- FastAPI Auth (port `8000`)
- React frontend (port `3000`)

### 6. Run Database Migrations

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 7. Start Development Servers

**Terminal 1 - Frontend:**
```bash
npm run dev
```
Frontend will be available at `http://localhost:3000`

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```
Backend will be available at `http://localhost:3001`

## Detailed Setup

### Frontend Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   Create `.env.local`:
   ```env
   VITE_API_URL=http://localhost:3001/api
   GEMINI_API_KEY=your_api_key
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```

4. **Build for Production:**
   ```bash
   npm run build
   npm run preview
   ```

### Backend Setup

1. **Navigate to Backend Directory:**
   ```bash
   cd backend
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```env
   # Database
   DATABASE_URL=postgresql://finity:finity_password@localhost:5432/finity_db?schema=public
   
   # Redis
   REDIS_URL=redis://localhost:6379
   
   # JWT
   JWT_SECRET=your_jwt_secret_here
   JWT_REFRESH_SECRET=your_refresh_secret_here
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   
   # Server
   NODE_ENV=development
   PORT=3001
   CORS_ORIGIN=http://localhost:3000
   
   # Email
   EMAIL_SERVICE=resend
   EMAIL_API_KEY=your_email_api_key
   EMAIL_FROM=noreply@finity.ai
   
   # AI Providers (optional, for fallback)
   GEMINI_API_KEY=your_gemini_key
   OPENAI_API_KEY=your_openai_key
   ```

4. **Database Setup:**
   ```bash
   # Start Docker services
   docker-compose up -d
   
   # Run migrations
   npx prisma migrate dev
   
   # Generate Prisma Client
   npx prisma generate
   
   # Seed database (optional)
   npx prisma db seed
   ```

5. **Start Development Server:**
   ```bash
   npm run dev
   ```

### Docker Setup

The project uses Docker Compose for database and cache services.

**Start Services:**
```bash
docker-compose up -d
```

**Stop Services:**
```bash
docker-compose down
```

**View Logs:**
```bash
docker-compose logs -f postgres
docker-compose logs -f redis
```

**Access pgAdmin:**
- URL: `http://localhost:5050`
- Email: `admin@finity.ai`
- Password: `admin`

**Connect to PostgreSQL:**
```bash
docker exec -it finity-postgres psql -U finity -d finity_db
```

## IDE Setup

### VS Code Extensions

Recommended extensions:

- **ESLint** - JavaScript linting
- **Prettier** - Code formatting
- **Prisma** - Prisma syntax highlighting
- **Tailwind CSS IntelliSense** - Tailwind autocomplete
- **React snippets** - React code snippets

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["html`([^`]*)`", "className=['\"`]([^'\"`]*)['\"`]"]
  ]
}
```

## API Keys Setup

All API keys must be configured in your `.env` file (project root). The application will validate required API keys at startup and exit with a clear error message if any are missing.

### Required API Keys

#### Google Gemini API Key (Required)

The primary AI provider. The application requires this key to function.

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Add to `.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

**Note:** Without this key, the application will fail to start.

### Optional AI Provider API Keys

These enable additional AI providers that users can select in the application settings. If not configured, those provider options will be unavailable.

#### OpenAI API Key (Optional)

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add to `.env`:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

#### Anthropic Claude API Key (Optional)

1. Go to [Anthropic Console](https://console.anthropic.com/account/keys)
2. Create an API key
3. Add to `.env`:
   ```env
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

#### Groq API Key (Optional)

Used for Llama models via Groq.

1. Go to [Groq Console](https://console.groq.com/keys)
2. Create an API key
3. Add to `.env`:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

### Payment Provider API Keys

#### Stripe (Optional)

Required for Stripe payment processing and subscriptions.

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Developers** → **API keys**
3. Copy your **Secret key**
4. Add to `.env`:
   ```env
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PRICE_ID_PRO=price_xxxxx  # From Stripe Products dashboard
   STRIPE_PRICE_ID_ENTERPRISE=price_xxxxx  # From Stripe Products dashboard
   ```

5. For webhooks (required for production):
   ```bash
   # Install Stripe CLI
   stripe listen --forward-to localhost:3001/api/webhooks/stripe
   ```
   Copy the webhook signing secret (starts with `whsec_...`) to `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

#### PayPal (Optional)

Required for PayPal payment processing and subscriptions.

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Navigate to **My Apps & Credentials**
3. Create a new app or use existing app
4. Copy **Client ID** and **Secret**
5. Add to `.env`:
   ```env
   PAYPAL_CLIENT_ID=your_paypal_client_id
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret
   PAYPAL_MODE=sandbox  # or 'live' for production
   PAYPAL_PLAN_ID_PRO=plan_xxxxx  # From PayPal Products dashboard
   PAYPAL_PLAN_ID_ENTERPRISE=plan_xxxxx  # From PayPal Products dashboard
   ```

6. For webhooks (required for production):
   - Go to **My Apps & Credentials** → **Webhooks**
   - Create a webhook and copy the **Webhook ID**
   - Add to `.env`:
     ```env
     PAYPAL_WEBHOOK_ID=your_paypal_webhook_id
     ```

### Email Service API Keys

#### Resend (Optional)

Used for sending transactional emails (quota warnings, password resets, etc.).

1. Go to [Resend](https://resend.com/api-keys)
2. Create an API key
3. Add to `.env`:
   ```env
   EMAIL_API_KEY=re_xxxxx  # or RESEND_API_KEY
   EMAIL_FROM=noreply@yourdomain.com
   EMAIL_FROM_NAME=Nova‑XFinity AI
   ```

**Note:** If not configured, email features will be disabled and warnings will be logged.

### Environment Variable Validation

The application validates all required environment variables at startup:

- **Required variables** (app will exit if missing):
  - `DATABASE_URL`
  - `SECRET` (JWT secret)
  - `GEMINI_API_KEY` (primary AI provider)

- **Optional variables** (warnings if missing, features unavailable):
  - `OPENAI_API_KEY`
  - `ANTHROPIC_API_KEY`
  - `GROQ_API_KEY`
  - `STRIPE_SECRET_KEY`
  - `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET`
  - `EMAIL_API_KEY` / `RESEND_API_KEY`

When the application starts, you'll see validation output:

```
✅ All required environment variables are set
⚠️  Environment Variable Warnings:
   - Optional API key not set: OPENAI_API_KEY (some features may be unavailable)
   - Optional API key not set: STRIPE_SECRET_KEY (some features may be unavailable)
```

If required variables are missing:

```
❌ Missing Required Environment Variables:
   - Missing required environment variable: DATABASE_URL
   - Missing critical API key: GEMINI_API_KEY

💡 Please set all required environment variables in your .env file.
   See .env.example for a complete list of required variables.
```

## Database Access

### Using Prisma Studio

```bash
cd backend
npx prisma studio
```

Prisma Studio will open at `http://localhost:5555`

### Using pgAdmin

1. Access pgAdmin at `http://localhost:5050`
2. Login with credentials from `docker-compose.yml`
3. Add new server:
   - Host: `postgres`
   - Port: `5432`
   - Username: `finity`
   - Password: `finity_password`
   - Database: `finity_db`

### Using psql Command Line

```bash
docker exec -it finity-postgres psql -U finity -d finity_db
```

## Testing Setup

### Frontend Tests

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

### Backend Tests

```bash
cd backend

# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- auth.test.js
```

## Troubleshooting

### Port Already in Use

If port 3000 or 3001 is already in use:

**Frontend:**
```bash
# Change port in vite.config.ts
server: {
  port: 3002
}
```

**Backend:**
```bash
# Change PORT in .env
PORT=3002
```

### Docker Issues

**Reset Docker containers:**
```bash
docker-compose down -v
docker-compose up -d
```

**Rebuild containers:**
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Issues

1. Check if PostgreSQL is running:
   ```bash
   docker-compose ps
   ```

2. Verify connection string in `.env`

3. Check logs:
   ```bash
   docker-compose logs postgres
   ```

### Prisma Issues

**Reset database:**
```bash
cd backend
npx prisma migrate reset
npx prisma migrate dev
```

**Regenerate Prisma Client:**
```bash
npx prisma generate
```

## Environment Variables Reference

### Frontend (.env.local)

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL | Yes |
| `GEMINI_API_KEY` | Gemini API key | Yes |

### Backend (.env)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SECRET` | JWT signing secret | Yes |
| `GEMINI_API_KEY` | Gemini API key (primary AI provider) | Yes |
| `OPENAI_API_KEY` | OpenAI API key | No |
| `ANTHROPIC_API_KEY` | Anthropic/Claude API key | No |
| `GROQ_API_KEY` | Groq API key (for Llama models) | No |
| `STRIPE_SECRET_KEY` | Stripe secret key | No |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | No |
| `STRIPE_PRICE_ID_PRO` | Stripe price ID for Pro plan | No |
| `STRIPE_PRICE_ID_ENTERPRISE` | Stripe price ID for Enterprise plan | No |
| `PAYPAL_CLIENT_ID` | PayPal client ID | No |
| `PAYPAL_CLIENT_SECRET` | PayPal client secret | No |
| `PAYPAL_MODE` | PayPal mode (sandbox/live) | No |
| `PAYPAL_PLAN_ID_PRO` | PayPal plan ID for Pro plan | No |
| `PAYPAL_PLAN_ID_ENTERPRISE` | PayPal plan ID for Enterprise plan | No |
| `PAYPAL_WEBHOOK_ID` | PayPal webhook ID | No |
| `EMAIL_API_KEY` | Resend API key | No |
| `RESEND_API_KEY` | Resend API key (alternative name) | No |
| `EMAIL_FROM` | Email sender address | No |
| `EMAIL_FROM_NAME` | Email sender name | No |
| `FRONTEND_URL` | Frontend URL for redirects | No |
| `PORT` | Server port | No (default: 3001) |
| `CORS_ORIGIN` | Allowed CORS origins | No (default: http://localhost:3000) |
| `NODE_ENV` | Environment (development/production) | No |
| `DEFAULT_AI_PROVIDER` | Default AI provider (gemini/openai/anthropic/llama) | No (default: gemini) |

**Note:** See `.env.example` in the project root for a complete list with descriptions.

## Access Points

After starting services, access:

| Service     | URL                                            |
| ----------- | ---------------------------------------------- |
| Frontend    | [http://localhost:3000](http://localhost:3000) |
| Auth API    | [http://localhost:8000](http://localhost:8000) |
| Node API    | [http://localhost:3001](http://localhost:3001) |
| DB Admin UI | (optional, via pgAdmin)                        |

## Testing Locally

Once services are running, you can test:
- All login flows (OAuth, email)
- Referral + invite logic
- Protected routes via test user accounts
- Admin dashboard UI (if admin)

**Note:** Use `npm run dev:local` if you want to run services **outside Docker**

---

**Note:** Content merged from `local-dev-setup.md` (deleted) - Jan 07, 2026

## Related Documents

- [Code Organization](code-organization.md) - Project structure and organization
- [Contributing Guidelines](contributing.md) - How to contribute to the project
- [Backend Architecture](../architecture/backend-architecture.md) - Backend system architecture
- [Frontend Architecture](../architecture/frontend-architecture.md) - Frontend system architecture
- [Deployment Process](deployment-process.md) - Production deployment guide
- [Docker Containerization System](docker-containerization-system.md) - Docker-based service orchestration and development workflow
