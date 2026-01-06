# Quick Start Guide

Get Finity Auth Starter running in 5 minutes!

## Prerequisites

- Docker and Docker Compose installed
- Git installed

## Steps

1. **Clone or navigate to the project**
   ```bash
   cd finity-auth-starter
   ```

2. **Create environment file**
   ```bash
   cp env.example .env
   ```

3. **Edit `.env` file** (minimum required changes)
   - Generate a secure JWT secret:
     ```bash
     # On Linux/Mac:
     openssl rand -hex 32
     
     # Or use any secure random string generator
     ```
   - Set `JWT_SECRET_KEY` to the generated value
   - (Optional) Configure OAuth providers for social login
   - (Optional) Configure SMTP for email functionality

4. **Start the application**
   ```bash
   docker-compose up -d
   ```

5. **Wait for services to start** (about 30 seconds)
   ```bash
   docker-compose ps
   ```
   All services should show "Up" status.

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## First User Registration

1. Go to http://localhost:3000/register
2. Fill in the registration form
3. **Important**: Check the required checkbox agreeing to Privacy Policy, Terms of Service, and Return & Refund Policy
4. Submit the form
5. Check your email for verification (if SMTP is configured)
6. Or use the verification link from the backend logs

## Testing Without Email

If SMTP is not configured, the app will still work but emails won't be sent. You can:
- Check backend logs for verification tokens
- Use the API directly to verify emails
- Configure SMTP later (see SETUP.md)

## Next Steps

- Configure OAuth providers (see SETUP.md)
- Set up production environment
- Customize the UI
- Add additional features

## Troubleshooting

**Services won't start?**
```bash
docker-compose logs
```

**Database connection issues?**
```bash
docker-compose restart postgres
```

**Port already in use?**
Edit `docker-compose.yml` to change port mappings.

## Need Help?

- Check SETUP.md for detailed configuration
- Review API.md for API documentation
- Open an issue on GitHub
