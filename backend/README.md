# Nova‑XFinity AI Backend

Backend API for Nova‑XFinity AI Article Writer.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   # Copy from project root (or backend directory)
   cp ../env.example ../.env
   # Edit .env with your configuration
   ```
   
   **Important:** The application validates required environment variables at startup. Ensure all required variables are set:
   - `DATABASE_URL` (required)
   - `SECRET` (required - JWT secret)
   - `GEMINI_API_KEY` (required - primary AI provider)
   
   See `env.example` in the project root for a complete list of required and optional variables.

3. **Start Docker services:**
   ```bash
   docker-compose up -d
   ```

4. **Run migrations:**
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

## Database

- **PostgreSQL:** Running on port 5432
- **pgAdmin:** Available at http://localhost:5050
- **Redis:** Running on port 6379

## API Endpoints

- Health: `GET /health`
- API: `/api/*` (to be implemented)

See [API Documentation](../docs/architecture/api.md) for details.
