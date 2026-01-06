# Setup Guide

## Prerequisites

- Docker and Docker Compose installed
- Git installed
- (Optional) Node.js 18+ and Python 3.11+ for local development

## Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finity-auth-starter
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` file**
   - Set `JWT_SECRET_KEY` to a secure random string
   - Configure OAuth credentials (optional for testing)
   - Configure SMTP settings (optional for testing)

4. **Start the application**
   ```bash
   docker-compose up -d
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Local Development Setup

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Create a `.env` file in the `backend` directory with the same variables as `.env.example`

5. **Run database migrations**
   ```bash
   # The app will create tables automatically on first run
   # Or use Alembic for migrations:
   alembic upgrade head
   ```

6. **Start the server**
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```
   REACT_APP_API_URL=http://localhost:8000
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

## OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Add authorized redirect URI: `http://localhost:8000/api/auth/social/google/callback`
6. Copy Client ID and Client Secret to `.env`

### Discord OAuth

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "OAuth2" section
4. Add redirect URI: `http://localhost:8000/api/auth/social/discord/callback`
5. Copy Client ID and Client Secret to `.env`

### X (Twitter) OAuth

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app
3. Set callback URL: `http://localhost:8000/api/auth/social/twitter/callback`
4. Copy Client ID and Client Secret to `.env`

## Email Configuration

### Gmail SMTP

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use these settings:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   ```

### Mailgun

1. Sign up at [Mailgun](https://www.mailgun.com/)
2. Get your SMTP credentials from the dashboard
3. Use Mailgun's SMTP settings in `.env`

## Database

The application uses PostgreSQL. With Docker Compose, the database is automatically set up.

To connect manually:
- Host: `localhost`
- Port: `5432`
- Database: `finity_auth`
- Username: `postgres`
- Password: `postgres` (change in production!)

## Production Deployment

1. **Update environment variables**
   - Set `ENVIRONMENT=production`
   - Use strong `JWT_SECRET_KEY`
   - Update `FRONTEND_URL` and `BACKEND_URL` with production URLs
   - Configure production database
   - Set up production SMTP

2. **Build and deploy**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Set up SSL/TLS certificates** (recommended)

4. **Configure reverse proxy** (Nginx, Traefik, etc.)

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL container is running: `docker-compose ps`
- Check database logs: `docker-compose logs postgres`

### OAuth Not Working
- Verify redirect URIs match exactly
- Check OAuth credentials in `.env`
- Review browser console and backend logs

### Email Not Sending
- Verify SMTP credentials
- Check firewall settings
- Review email service logs
- Test SMTP connection manually

### Frontend Can't Connect to Backend
- Verify `REACT_APP_API_URL` in frontend `.env`
- Check CORS settings in backend
- Ensure backend is running
