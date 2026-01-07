# Development Environment Setup

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

### Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to `.env.local`:
   ```env
   GEMINI_API_KEY=your_key_here
   ```

### OpenAI API Key (Optional)

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Store via Settings UI or backend API

### Anthropic Claude API Key (Optional)

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an API key
3. Store via Settings UI or backend API

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
| `REDIS_URL` | Redis connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_REFRESH_SECRET` | Refresh token secret | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port | Yes |
| `CORS_ORIGIN` | Allowed CORS origins | Yes |
| `EMAIL_SERVICE` | Email provider | No |
| `EMAIL_API_KEY` | Email API key | No |

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

## Next Steps

- Read [Code Organization](code-organization.md) for project structure
- Check [Contributing Guidelines](contributing.md) before making changes
- Review [Backend Architecture](../architecture/backend-architecture.md) and [Frontend Architecture](../architecture/frontend-architecture.md) for system design
- See [Deployment Process](deployment-process.md) for production deployment
