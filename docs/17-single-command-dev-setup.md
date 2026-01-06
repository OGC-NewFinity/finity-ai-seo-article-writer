# Single Command Development Setup

This document explains how to run the entire Finity AI SEO Article Writer application stack with a single command.

## Overview

The project has been refactored to run all services (database, backends, and frontend) using Docker Compose with a single command. This eliminates the need for multiple terminal tabs and manual service management.

## Architecture

The unified setup includes the following services:

- **finity-db**: PostgreSQL database (port 5432)
- **finity-backend**: Python/FastAPI authentication backend (port 8000)
- **finity-backend-node**: Node.js/Express subscription and webhooks backend (port 3001)
- **finity-frontend**: React/Vite frontend application (port 3000)

All services are connected via a Docker network (`finity-network`) and have proper health checks and dependency management.

## Prerequisites

1. **Docker** and **Docker Compose** installed on your system
2. **Node.js** (for local development, optional when using Docker)
3. A `.env` file in the project root (copy from `env.example`)

## Quick Start

### Starting All Services

From the project root directory, run:

```bash
npm run dev
```

**OR**

```bash
docker compose up --build
```

This single command will:
1. Build all Docker images (if needed)
2. Start the PostgreSQL database
3. Wait for the database to be healthy
4. Start the Python authentication backend
5. Start the Node.js backend
6. Start the frontend application
7. Display logs from all services in a single terminal

### What Happens During Startup

1. **Database (finity-db)**: Starts first and waits until it's ready to accept connections
2. **Python Backend (finity-backend)**: Waits for the database, then starts on port 8000
3. **Node.js Backend (finity-backend-node)**: Waits for both database and Python backend, runs Prisma migrations, then starts on port 3001
4. **Frontend (finity-frontend)**: Waits for both backends to be healthy, then starts on port 3000

### Accessing Services

Once all services are running, you can access:

- **Frontend**: http://localhost:3000
- **Python Backend API**: http://localhost:8000
  - API Documentation: http://localhost:8000/docs
- **Node.js Backend API**: http://localhost:3001
  - Health Check: http://localhost:3001/health
- **Database**: localhost:5432 (from host machine)

## Stopping Services

### Stop and Keep Containers

Press `Ctrl+C` in the terminal where `docker compose up` is running.

### Stop and Remove Containers

```bash
docker compose down
```

### Stop, Remove Containers, and Volumes

```bash
docker compose down -v
```

**Warning**: This will delete all database data!

## Resetting Containers

### Full Reset (Clean Slate)

If you need to completely reset everything:

```bash
# Stop and remove all containers, networks, and volumes
docker compose down -v

# Remove all images (optional, forces rebuild)
docker compose build --no-cache

# Start fresh
npm run dev
```

### Reset Specific Service

To reset a specific service:

```bash
# Stop and remove a specific service
docker compose stop finity-backend
docker compose rm -f finity-backend

# Restart it
docker compose up finity-backend
```

## Environment Variables

All services use the `.env` file from the project root. Key variables:

- `DATABASE_URL`: PostgreSQL connection string for Python backend
- `NODE_DATABASE_URL`: PostgreSQL connection string for Node.js backend
- `VITE_API_URL`: Frontend API endpoint (default: http://localhost:8000)
- `VITE_SUBSCRIPTION_API_URL`: Subscription API endpoint
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`: Database credentials

See `env.example` for a complete list of required variables.

## Service Dependencies

The services start in the following order:

```
finity-db (database)
    ↓
finity-backend (Python auth)
    ↓
finity-backend-node (Node.js subscriptions)
    ↓
finity-frontend (React app)
```

Each service waits for its dependencies to be healthy before starting.

## Health Checks

All services include health checks:

- **finity-db**: Checks PostgreSQL readiness
- **finity-backend**: Checks if `/docs` endpoint is accessible
- **finity-backend-node**: Checks if `/health` endpoint returns 200
- **finity-frontend**: Checks if the root page is accessible

## Development Workflow

### Viewing Logs

All service logs are displayed in the terminal where you ran `npm run dev`. To view logs for a specific service:

```bash
docker compose logs -f finity-backend
docker compose logs -f finity-frontend
```

### Running Commands in Containers

```bash
# Access Python backend container
docker compose exec finity-backend bash

# Access Node.js backend container
docker compose exec finity-backend-node sh

# Access frontend container
docker compose exec finity-frontend sh

# Run Prisma migrations manually
docker compose exec finity-backend-node npx prisma migrate dev

# Run Prisma Studio
docker compose exec finity-backend-node npx prisma studio
```

### Hot Reload

All services support hot reload in development:

- **Python Backend**: Uses `uvicorn --reload` flag
- **Node.js Backend**: Uses nodemon (when running locally) or volume mounts
- **Frontend**: Vite's built-in HMR (Hot Module Replacement)

Changes to code are automatically reflected without restarting containers.

## Troubleshooting

### Services Won't Start

1. **Check if ports are already in use**:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   netstat -ano | findstr :8000
   
   # Linux/Mac
   lsof -i :3000
   lsof -i :8000
   ```

2. **Check Docker logs**:
   ```bash
   docker compose logs
   ```

3. **Verify .env file exists and has correct values**

### Database Connection Issues

1. **Check database is healthy**:
   ```bash
   docker compose ps
   ```

2. **Verify DATABASE_URL format**:
   - Python backend: `postgresql+asyncpg://user:password@finity-db:5432/dbname`
   - Node.js backend: `postgresql://user:password@finity-db:5432/dbname`

### Frontend Can't Connect to Backend

1. **Check CORS settings** in backend services
2. **Verify VITE_API_URL** in `.env` file
3. **Check network connectivity**:
   ```bash
   docker compose exec finity-frontend ping finity-backend
   ```

### Prisma Migration Issues

If the Node.js backend fails to start due to migration issues:

```bash
# Run migrations manually
docker compose exec finity-backend-node npx prisma migrate deploy

# Or reset the database
docker compose down -v
docker compose up finity-db
# Then run migrations
docker compose exec finity-backend-node npx prisma migrate dev
```

## Production Considerations

This setup is optimized for **development**. For production:

1. Remove `--reload` flags and volume mounts
2. Use production-ready Docker images
3. Set up proper secrets management
4. Configure reverse proxy (nginx/traefik)
5. Enable SSL/TLS
6. Set up proper backup strategies for the database
7. Use environment-specific docker-compose files

## Additional Commands

### Rebuild Specific Service

```bash
docker compose build finity-backend
docker compose up -d finity-backend
```

### View Service Status

```bash
docker compose ps
```

### View Resource Usage

```bash
docker stats
```

## Summary

With this setup, you can:

✅ Start all services with **one command**: `npm run dev`  
✅ Stop all services with **one command**: `Ctrl+C` or `docker compose down`  
✅ View all logs in **one terminal**  
✅ No need for multiple terminal tabs  
✅ Automatic dependency management  
✅ Health checks ensure services start in correct order  

The entire development environment is now containerized and orchestrated, making it easy to onboard new developers and maintain consistency across different machines.
