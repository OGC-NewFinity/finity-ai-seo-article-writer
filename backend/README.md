# Nova‑XFinity AI Backend

Backend API for Nova‑XFinity AI Article Writer.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

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
