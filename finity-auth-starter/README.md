# Finity Auth Starter

A complete, production-ready authentication boilerplate for the Finity project. This starter includes full authentication, social logins, user management, and Dockerized infrastructure.

## 🚀 Features

- **Multiple Authentication Methods**
  - Email and password
  - Google OAuth2
  - Discord OAuth2
  - X (Twitter) OAuth2

- **User Management**
  - User registration with legal agreement
  - Email verification
  - Password reset functionality
  - User profile management
  - Role-based access (user, admin)

- **Email Notifications**
  - Welcome emails
  - Password reset emails
  - Payment confirmations (ready for future plans)

- **Security & Compliance**
  - JWT-based authentication
  - GDPR-compliant
  - Secure password hashing (bcrypt)
  - CSRF protection
  - Rate limiting

- **UI/UX**
  - Responsive design
  - Dark/light theme support
  - Modern, clean interface

## 📋 Prerequisites

- Docker and Docker Compose
- Git

## 🛠️ Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finity-auth-starter
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your configuration. At minimum, set `JWT_SECRET_KEY` to a secure random string.

3. **Start the application**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

For detailed setup instructions, see [QUICKSTART.md](QUICKSTART.md) or [docs/SETUP.md](docs/SETUP.md).

## ⚙️ Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure the following:

#### Database
- `DATABASE_URL`: PostgreSQL connection string

#### JWT
- `JWT_SECRET_KEY`: Secret key for JWT tokens
- `JWT_ALGORITHM`: Algorithm for JWT (default: HS256)
- `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time

#### OAuth Providers
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `DISCORD_CLIENT_ID`: Discord OAuth client ID
- `DISCORD_CLIENT_SECRET`: Discord OAuth client secret
- `TWITTER_CLIENT_ID`: X (Twitter) OAuth client ID
- `TWITTER_CLIENT_SECRET`: X (Twitter) OAuth client secret

#### Email (SMTP)
- `SMTP_HOST`: SMTP server host
- `SMTP_PORT`: SMTP server port
- `SMTP_USER`: SMTP username
- `SMTP_PASSWORD`: SMTP password
- `SMTP_FROM_EMAIL`: Sender email address
- `SMTP_FROM_NAME`: Sender name

#### Application
- `FRONTEND_URL`: Frontend URL for OAuth callbacks
- `BACKEND_URL`: Backend URL
- `ENVIRONMENT`: Environment (development/production)

## 📁 Project Structure

```
finity-auth-starter/
├── frontend/              # React application
│   ├── public/
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── services/     # API services
│   │   ├── hooks/        # Custom React hooks
│   │   ├── context/      # React context providers
│   │   └── utils/        # Utility functions
│   ├── package.json
│   └── Dockerfile
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── auth/         # Authentication logic
│   │   ├── routes/       # API routes
│   │   ├── models/       # Database models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   ├── core/         # Core configuration
│   │   └── utils/        # Utility functions
│   ├── requirements.txt
│   └── Dockerfile
├── database/             # Database migrations
├── docker-compose.yml    # Docker orchestration
├── .env.example          # Environment template
└── docs/                 # Documentation
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/social/{provider}` - Initiate social login
- `GET /api/auth/social/{provider}/callback` - OAuth callback
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/verify-email` - Verify email address

### User Management
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `DELETE /api/users/me` - Delete user account

## 🔐 Social Login Setup

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:8000/api/auth/social/google/callback`

### Discord OAuth
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Add redirect URI: `http://localhost:8000/api/auth/social/discord/callback`

### X (Twitter) OAuth
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app
3. Add callback URL: `http://localhost:8000/api/auth/social/twitter/callback`

## 📧 Email Configuration

The application supports SMTP for sending emails. You can use:
- Gmail SMTP
- SendGrid
- Mailgun
- Any SMTP-compatible service

Configure SMTP settings in `.env` file.

## 🧪 Development

### Running without Docker

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

### Database Migrations
```bash
cd backend
alembic upgrade head
```

## 🚢 Deployment

1. Update environment variables for production
2. Set `ENVIRONMENT=production` in `.env`
3. Update `FRONTEND_URL` and `BACKEND_URL` with production URLs
4. Run `docker-compose up -d`

## 📝 Legal Compliance

The registration form includes a required checkbox for:
- Privacy Policy
- Terms of Service
- Return & Refund Policy

These pages should be created and linked appropriately for your use case.

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

This project is open-source and available under the MIT License.

## 🆘 Support

For issues and questions, please open an issue on GitHub.
