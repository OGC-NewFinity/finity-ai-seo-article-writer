# Finity AI SEO Article Writer - Complete Setup Guide

This comprehensive guide will walk you through all the steps required to set up and run the Finity AI SEO Article Writer plugin.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Overview](#project-overview)
3. [Frontend Setup](#frontend-setup)
4. [Backend Setup](#backend-setup)
5. [Database Setup](#database-setup)
6. [Environment Configuration](#environment-configuration)
7. [API Keys Configuration](#api-keys-configuration)
8. [WordPress Plugin Installation](#wordpress-plugin-installation)
9. [Running the Application](#running-the-application)
10. [Verification & Testing](#verification--testing)
11. [Troubleshooting](#troubleshooting)
12. [Production Deployment](#production-deployment)

---

## Prerequisites

Before starting, ensure you have the following installed on your system:

### Required Software

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
  - Required for PostgreSQL and Redis services
- **Git** - [Download](https://git-scm.com/)
- **WordPress** (v5.0 or higher) - For plugin integration

### Required Accounts & API Keys

- **Google Gemini API Key** - [Get from Google AI Studio](https://makersuite.google.com/app/apikey)
- **OpenAI API Key** (Optional) - [Get from OpenAI Platform](https://platform.openai.com/api-keys)
- **Anthropic Claude API Key** (Optional) - [Get from Anthropic Console](https://console.anthropic.com/)
- **Groq API Key** (Optional) - [Get from Groq](https://console.groq.com/)
- **Stripe API Keys** (Optional, for subscriptions) - [Get from Stripe Dashboard](https://dashboard.stripe.com/apikeys)

---

## Project Overview

The Finity AI SEO Article Writer consists of three main components:

1. **Frontend Application** - React-based UI (runs on port 3000)
2. **Backend API** - Node.js/Express server (runs on port 3001)
3. **WordPress Plugin** - PHP plugin for WordPress integration

### Architecture

```
Frontend (React + Vite) → Backend API (Express) → PostgreSQL Database
                                    ↓
                              Redis Cache
                                    ↓
                          WordPress Plugin (PHP)
```

---

## Frontend Setup

### Step 1: Navigate to Project Root

```bash
cd finity-ai-seo-article-writer
```

### Step 2: Install Frontend Dependencies

```bash
npm install
```

This will install:
- React 19.2.3
- React DOM 19.2.3
- Vite 6.2.0
- Google GenAI SDK
- HTM (HTML-in-JS templating)

### Step 3: Create Frontend Environment File

Create a `.env.local` file in the root directory:

```bash
# Windows PowerShell
New-Item -Path .env.local -ItemType File

# Linux/Mac
touch .env.local
```

### Step 4: Configure Frontend Environment Variables

Edit `.env.local` and add:

```env
# Backend API URL
VITE_API_URL=http://localhost:3001/api

# Google Gemini API Key (Required)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Other API keys can be configured via Settings UI
```

**Note:** The `GEMINI_API_KEY` is required for the application to work. Other API keys (OpenAI, Claude, Llama) can be configured later through the Settings panel in the UI.

---

## Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Backend Dependencies

```bash
npm install
```

This will install:
- Express.js
- Prisma ORM
- PostgreSQL Client
- Redis
- JWT (for authentication)
- Stripe (for payments)
- And other dependencies

### Step 3: Create Backend Environment File

Create a `.env` file in the `backend` directory:

```bash
# Windows PowerShell
New-Item -Path .env -ItemType File

# Linux/Mac
touch .env
```

### Step 4: Configure Backend Environment Variables

Edit `backend/.env` and add:

```env
# Database Configuration
DATABASE_URL=postgresql://finity:finity_password@localhost:5432/finity_db?schema=public

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server Configuration
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000

# Email Configuration (Optional)
EMAIL_SERVICE=resend
EMAIL_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@finity.ai

# Stripe Configuration (Optional, for subscriptions)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# AI Provider Keys (Optional, can also be set via frontend)
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_claude_api_key
GROQ_API_KEY=your_groq_api_key
```

**Important Security Notes:**
- Change `JWT_SECRET` and `JWT_REFRESH_SECRET` to strong, random strings in production
- Never commit `.env` files to version control
- Use different keys for development and production

---

## Database Setup

### Step 1: Start Docker Services

From the `backend` directory, start PostgreSQL and Redis:

```bash
docker-compose up -d
```

This will start:
- **PostgreSQL** on port `5432`
- **pgAdmin** on port `5050` (for database management)
- **Redis** on port `6379`

### Step 2: Verify Docker Services

Check that all services are running:

```bash
docker-compose ps
```

You should see three containers running:
- `finity-postgres`
- `finity-pgadmin`
- `finity-redis`

### Step 3: Run Database Migrations

Generate Prisma Client and run migrations:

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev
```

This will:
- Create all database tables (Users, Articles, Drafts, Subscriptions, etc.)
- Set up relationships and indexes
- Create the database schema

### Step 4: Verify Database Connection

You can verify the database is working by:

**Option 1: Using Prisma Studio (Recommended)**
```bash
npx prisma studio
```
This opens a visual database browser at `http://localhost:5555`

**Option 2: Using pgAdmin**
1. Open `http://localhost:5050`
2. Login with:
   - Email: `admin@finity.ai`
   - Password: `admin`
3. Add a new server:
   - Host: `postgres` (or `localhost` if connecting from outside Docker)
   - Port: `5432`
   - Username: `finity`
   - Password: `finity_password`
   - Database: `finity_db`

**Option 3: Using psql Command Line**
```bash
docker exec -it finity-postgres psql -U finity -d finity_db
```

---

## Environment Configuration

### Summary of Environment Files

You need to create and configure two environment files:

1. **Root `.env.local`** - Frontend configuration
2. **`backend/.env`** - Backend configuration

### Environment Variables Checklist

#### Frontend (.env.local)
- [ ] `VITE_API_URL` - Backend API URL
- [ ] `GEMINI_API_KEY` - Google Gemini API key (Required)

#### Backend (backend/.env)
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `REDIS_URL` - Redis connection string
- [ ] `JWT_SECRET` - JWT signing secret
- [ ] `JWT_REFRESH_SECRET` - Refresh token secret
- [ ] `NODE_ENV` - Environment (development/production)
- [ ] `PORT` - Backend server port
- [ ] `CORS_ORIGIN` - Allowed CORS origins
- [ ] `GEMINI_API_KEY` - Google Gemini API key (Optional, can use frontend key)
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key (Optional, for subscriptions)
- [ ] `EMAIL_API_KEY` - Email service API key (Optional)

---

## API Keys Configuration

### Required: Google Gemini API Key

1. **Get API Key:**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the generated key

2. **Add to Environment:**
   - Add to `.env.local`: `GEMINI_API_KEY=your_key_here`
   - Optionally add to `backend/.env` for backend fallback

### Optional: OpenAI API Key

1. **Get API Key:**
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key

2. **Configure:**
   - Add via Settings UI in the application, OR
   - Add to `backend/.env`: `OPENAI_API_KEY=your_key_here`

### Optional: Anthropic Claude API Key

1. **Get API Key:**
   - Visit [Anthropic Console](https://console.anthropic.com/)
   - Create an API key
   - Copy the key

2. **Configure:**
   - Add via Settings UI in the application, OR
   - Add to `backend/.env`: `ANTHROPIC_API_KEY=your_key_here`

### Optional: Groq API Key (for Llama)

1. **Get API Key:**
   - Visit [Groq Console](https://console.groq.com/)
   - Create an API key
   - Copy the key

2. **Configure:**
   - Add via Settings UI in the application, OR
   - Add to `backend/.env`: `GROQ_API_KEY=your_key_here`

### Optional: Stripe API Keys (for Subscriptions)

1. **Get API Keys:**
   - Visit [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
   - Copy Secret Key and Publishable Key
   - For webhooks, create a webhook endpoint and copy the webhook secret

2. **Add to Backend:**
   ```env
   STRIPE_SECRET_KEY=sk_test_your_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

---

## WordPress Plugin Installation

### Step 1: Copy Plugin to WordPress

Copy the `wordpress-plugin` folder to your WordPress plugins directory:

```bash
# On Windows
xcopy /E /I "wordpress-plugin" "C:\path\to\wordpress\wp-content\plugins\finity-ai-seo-writer"

# On Linux/Mac
cp -r wordpress-plugin /path/to/wordpress/wp-content/plugins/finity-ai-seo-writer
```

Or manually:
1. Navigate to your WordPress installation
2. Go to `wp-content/plugins/`
3. Create a folder named `finity-ai-seo-writer`
4. Copy all files from `wordpress-plugin/` to this folder

### Step 2: Activate Plugin

1. Log in to WordPress Admin Dashboard
2. Go to **Plugins** → **Installed Plugins**
3. Find "Finity AI SEO Article Writer"
4. Click **Activate**

### Step 3: Configure Plugin Settings

1. Go to **Finity AI** in the WordPress admin menu
2. The plugin will load the frontend application in an iframe
3. Configure the app URL if needed (default: `http://localhost:3000`)

### Step 4: Set App URL (if different from default)

If your frontend runs on a different URL or port:

1. In WordPress database or via code, set:
   ```php
   update_option('finity_ai_app_url', 'http://your-frontend-url:port');
   ```

Or edit `wordpress-plugin/finity-ai-seo-writer.php` line 60:
```php
$app_url = get_option('finity_ai_app_url', 'http://localhost:3000');
```

---

## Running the Application

### Development Mode

You need to run three services simultaneously:

#### Terminal 1: Frontend Development Server

```bash
# From project root
npm run dev
```

Frontend will be available at: `http://localhost:3000`

#### Terminal 2: Backend API Server

```bash
# From backend directory
cd backend
npm run dev
```

Backend will be available at: `http://localhost:3001`

#### Terminal 3: Docker Services (if not already running)

```bash
# From backend directory
cd backend
docker-compose up -d
```

### Production Build

#### Build Frontend

```bash
# From project root
npm run build
```

This creates a `dist/` folder with production-ready files.

#### Preview Production Build

```bash
npm run preview
```

#### Start Backend in Production

```bash
# From backend directory
cd backend
NODE_ENV=production npm start
```

---

## Verification & Testing

### Step 1: Verify Frontend

1. Open `http://localhost:3000` in your browser
2. You should see the Finity AI dashboard
3. Check browser console for any errors

### Step 2: Verify Backend

1. Check health endpoint:
   ```bash
   curl http://localhost:3001/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. Test API routes (if authentication is set up):
   ```bash
   curl http://localhost:3001/api/subscription/status
   ```

### Step 3: Verify Database

1. Open Prisma Studio:
   ```bash
   cd backend
   npx prisma studio
   ```
2. Check that tables are created and accessible

### Step 4: Verify WordPress Integration

1. Log in to WordPress Admin
2. Navigate to **Finity AI** menu
3. The frontend application should load in an iframe
4. Try creating a test article

### Step 5: Test AI Generation

1. In the frontend, go to **Writer** tab
2. Enter a topic and keywords
3. Click "Generate Article"
4. Verify that AI content is generated

### Step 6: Test Multi-Provider Support

1. Go to **Settings**
2. Switch between different AI providers (Gemini, OpenAI, Claude, Llama)
3. Generate content with each provider
4. Verify fallback works if a provider fails

---

## Troubleshooting

### Port Already in Use

**Problem:** Port 3000 or 3001 is already in use

**Solution:**

**Frontend:**
Edit `vite.config.ts`:
```typescript
server: {
  port: 3002  // Change to available port
}
```

**Backend:**
Edit `backend/.env`:
```env
PORT=3002  // Change to available port
```

Update `CORS_ORIGIN` and `VITE_API_URL` accordingly.

### Docker Issues

**Problem:** Docker containers won't start

**Solution:**
```bash
# Stop and remove containers
docker-compose down -v

# Rebuild containers
docker-compose build --no-cache

# Start services
docker-compose up -d
```

**Problem:** Database connection fails

**Solution:**
1. Verify Docker is running: `docker ps`
2. Check container logs: `docker-compose logs postgres`
3. Verify `DATABASE_URL` in `backend/.env` matches docker-compose.yml
4. Ensure PostgreSQL is healthy: `docker-compose ps`

### Database Migration Issues

**Problem:** Prisma migrations fail

**Solution:**
```bash
cd backend

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Run migrations again
npx prisma migrate dev

# Regenerate Prisma Client
npx prisma generate
```

### API Key Issues

**Problem:** "API Key missing" errors

**Solution:**
1. Verify `GEMINI_API_KEY` is set in `.env.local`
2. Restart the frontend dev server after adding keys
3. Check that the key is valid at [Google AI Studio](https://makersuite.google.com/app/apikey)
4. For other providers, add keys via Settings UI or backend `.env`

### CORS Errors

**Problem:** CORS errors in browser console

**Solution:**
1. Verify `CORS_ORIGIN` in `backend/.env` matches frontend URL
2. Check that backend is running
3. Ensure `VITE_API_URL` in `.env.local` matches backend URL

### WordPress Plugin Not Loading

**Problem:** Plugin page shows blank or error

**Solution:**
1. Verify frontend is running at the configured URL
2. Check WordPress error logs: `wp-content/debug.log`
3. Verify plugin files are in correct location
4. Check browser console for iframe errors
5. Ensure WordPress user has `edit_posts` capability

### Prisma Client Not Generated

**Problem:** "Cannot find module '@prisma/client'"

**Solution:**
```bash
cd backend
npx prisma generate
```

### Redis Connection Issues

**Problem:** Redis connection errors

**Solution:**
1. Verify Redis container is running: `docker-compose ps`
2. Check Redis logs: `docker-compose logs redis`
3. Verify `REDIS_URL` in `backend/.env`
4. Test connection: `docker exec -it finity-redis redis-cli ping`

### Module Not Found Errors

**Problem:** "Cannot find module" errors

**Solution:**
```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

---

## Production Deployment

### Frontend Deployment

1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Deploy `dist/` folder:**
   - Upload to static hosting (Vercel, Netlify, AWS S3, etc.)
   - Or serve with nginx/apache

3. **Update environment variables:**
   - Set production `VITE_API_URL`
   - Set production `GEMINI_API_KEY`

### Backend Deployment

1. **Set production environment:**
   ```env
   NODE_ENV=production
   PORT=3001
   CORS_ORIGIN=https://your-frontend-domain.com
   ```

2. **Update database URL:**
   ```env
   DATABASE_URL=postgresql://user:password@production-db-host:5432/finity_db
   ```

3. **Use process manager:**
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start backend/src/index.js --name finity-backend
   ```

4. **Set up reverse proxy (nginx example):**
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Database Deployment

1. **Use managed PostgreSQL:**
   - AWS RDS, Google Cloud SQL, or similar
   - Update `DATABASE_URL` in production `.env`

2. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   ```

### WordPress Plugin Deployment

1. **Package plugin:**
   ```bash
   zip -r finity-ai-seo-writer.zip wordpress-plugin/
   ```

2. **Install on production WordPress:**
   - Upload via WordPress admin
   - Or manually copy to `wp-content/plugins/`

3. **Update app URL:**
   - Set production frontend URL in plugin settings

### Security Checklist

- [ ] Change all default passwords and secrets
- [ ] Use strong JWT secrets (32+ characters, random)
- [ ] Enable HTTPS for all services
- [ ] Set up firewall rules
- [ ] Use environment-specific API keys
- [ ] Enable database backups
- [ ] Set up monitoring and logging
- [ ] Review and restrict CORS origins
- [ ] Enable rate limiting
- [ ] Use secure cookie settings

---

## Quick Start Checklist

Use this checklist to ensure everything is set up correctly:

### Initial Setup
- [ ] Node.js v18+ installed
- [ ] Docker Desktop installed and running
- [ ] Project cloned/downloaded
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Backend dependencies installed (`cd backend && npm install`)

### Configuration
- [ ] `.env.local` created in root with `GEMINI_API_KEY`
- [ ] `backend/.env` created with all required variables
- [ ] Database connection string configured
- [ ] JWT secrets set (change from defaults)

### Database
- [ ] Docker services started (`docker-compose up -d`)
- [ ] Prisma Client generated (`npx prisma generate`)
- [ ] Database migrations run (`npx prisma migrate dev`)
- [ ] Database verified (Prisma Studio or pgAdmin)

### API Keys
- [ ] Google Gemini API key obtained and configured
- [ ] Optional: OpenAI API key configured (if using)
- [ ] Optional: Claude API key configured (if using)
- [ ] Optional: Groq API key configured (if using)

### WordPress (Optional)
- [ ] WordPress installed
- [ ] Plugin files copied to `wp-content/plugins/`
- [ ] Plugin activated in WordPress admin
- [ ] App URL configured in plugin

### Running
- [ ] Frontend dev server running (`npm run dev`)
- [ ] Backend API server running (`cd backend && npm run dev`)
- [ ] Frontend accessible at `http://localhost:3000`
- [ ] Backend health check passing (`http://localhost:3001/health`)

### Testing
- [ ] Can access frontend dashboard
- [ ] Can generate article with AI
- [ ] Settings panel works
- [ ] Multi-provider switching works
- [ ] WordPress integration works (if installed)

---

## Additional Resources

### Documentation

- [Architecture Overview](docs/architecture/overview.md)
- [API Documentation](docs/architecture/api.md)
- [Database Schema](docs/architecture/database.md)
- [Development Setup](docs/development/setup.md)
- [Contributing Guidelines](docs/development/contributing.md)

### Support

- Check [GitHub Issues](https://github.com/yourusername/finity-ai-seo-article-writer/issues)
- Review [Troubleshooting](#troubleshooting) section above
- Check application logs for detailed error messages

### Useful Commands

```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Backend
cd backend
npm run dev          # Start development server
npm start            # Start production server
npx prisma studio    # Open database browser
npx prisma migrate dev  # Run migrations
npx prisma generate  # Generate Prisma Client

# Docker
docker-compose up -d     # Start services
docker-compose down      # Stop services
docker-compose logs -f   # View logs
docker-compose ps        # Check status
```

---

## Next Steps

After completing the setup:

1. **Explore the Features:**
   - Try generating articles with different AI providers
   - Test the Research module
   - Experiment with MediaHub for image/video generation
   - Configure your preferences in Settings

2. **Customize Configuration:**
   - Adjust system instructions in `constants.js`
   - Configure subscription plans
   - Set up email notifications
   - Configure Stripe for payments

3. **Development:**
   - Read [Code Organization](docs/development/code-organization.md)
   - Review [Architecture](docs/architecture/overview.md)
   - Check [Contributing Guidelines](docs/development/contributing.md)

4. **Production:**
   - Follow [Production Deployment](#production-deployment) guide
   - Set up monitoring and backups
   - Configure domain and SSL certificates

---

**Congratulations!** 🎉 You've successfully set up the Finity AI SEO Article Writer. Start creating amazing SEO-optimized content!

---

*Last Updated: January 2025*
*For issues or questions, please refer to the troubleshooting section or open a GitHub issue.*
