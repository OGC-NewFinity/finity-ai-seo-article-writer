# Database Migration Guide

## What is a Migration?

A **migration** is a way to update your database structure to match changes in your code. 

When we added the `GenerationFailure` model to the Prisma schema file (`prisma/schema.prisma`), we defined what the database table should look like. However, the actual table doesn't exist in your database yet - we need to create it!

## Why Run This Migration?

The `GenerationFailure` model is used to track when AI generation operations fail (like when an article generation fails, or image generation fails). Without running the migration, your application won't be able to save failure logs to the database.

## ⚠️ IMPORTANT: Before Running Migration

### Step 1: Start Docker Database

First, make sure your PostgreSQL database is running. From the `backend` folder:

```bash
cd backend
docker-compose up -d
```

This starts the PostgreSQL database container. Wait a few seconds for it to be ready.

### Step 2: Create .env File

You need a `.env` file in the **project root** (not the backend folder) with the `DATABASE_URL` set.

**Option A: Copy from env.example and update DATABASE_URL**
```bash
# From project root
cp env.example .env
# Then edit .env and set:
# DATABASE_URL=postgresql://finity:finity_password@localhost:5432/finity_db
```

**Option B: Create .env manually with minimum required variables:**
```env
# Database Configuration (REQUIRED for migration)
DATABASE_URL=postgresql://finity:finity_password@localhost:5432/finity_db

# JWT Secret (REQUIRED for app to run)
SECRET=your-secret-key-here

# AI Provider (REQUIRED for app to run)
GEMINI_API_KEY=your-gemini-api-key-here
```

The `DATABASE_URL` format is:
```
postgresql://[USER]:[PASSWORD]@localhost:5432/[DATABASE]
```

For the backend database:
- **USER**: `finity`
- **PASSWORD**: `finity_password`
- **DATABASE**: `finity_db`
- **PORT**: `5432`

## How to Run the Migration

### Option 1: Using npm script (Recommended)

1. Open a terminal/command prompt
2. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
3. Run the migration:
   ```bash
   npm run prisma:migrate
   ```
   When prompted, enter the migration name: `add_generation_failures`

### Option 2: Using npx directly

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Run:
   ```bash
   npx prisma migrate dev --name add_generation_failures
   ```

### Option 3: Using PowerShell script

1. Navigate to the `backend` folder in PowerShell
2. Run:
   ```powershell
   .\run-migration.ps1
   ```

## What Happens When You Run the Migration?

1. Prisma will create a SQL migration file in `backend/prisma/migrations/`
2. Prisma will apply the migration to your database, creating the `generation_failures` table
3. Prisma will update the Prisma Client (code that talks to your database)

## After Migration

After the migration completes successfully, you should see:
- ✅ A new migration folder in `backend/prisma/migrations/`
- ✅ The `generation_failures` table in your PostgreSQL database
- ✅ Your application can now log generation failures

## Troubleshooting

**Error: "Environment variable not found: DATABASE_URL"**
- You need to create a `.env` file in the **project root** (not backend folder)
- Make sure it contains: `DATABASE_URL=postgresql://finity:finity_password@localhost:5432/finity_db`
- See Step 2 above for details

**Error: "Can't reach database server" or "Connection refused"**
- Make sure Docker is running: `docker-compose up -d` (from backend folder)
- Check that PostgreSQL container is running: `docker ps` (should show `finity-postgres`)
- Wait a few seconds after starting Docker for the database to be ready
- Verify your `DATABASE_URL` in the `.env` file is correct

**Error: "Migration already exists"**
- That's okay! It means the migration was already run
- You can continue using the application

**Error: "Schema drift detected"**
- This means your database schema doesn't match your Prisma schema
- Run `npx prisma migrate reset` (⚠️ WARNING: This will delete all data!)
- Or manually fix the database to match the schema

**Error: "Authentication failed" or "password authentication failed"**
- Check that your `DATABASE_URL` has the correct username and password
- Default credentials: user=`finity`, password=`finity_password`
- Make sure Docker container is using the same credentials

## Verify Migration Success

After running the migration, you can verify it worked:

1. **Check the database directly:**
   ```bash
   npx prisma studio
   ```
   This opens a browser window where you can see all your database tables, including `generation_failures`

2. **Check via SQL:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'generation_failures';
   ```

## Need Help?

If you encounter any issues, check:
- Your `.env` file has the correct `DATABASE_URL`
- Docker containers are running (`docker ps`)
- PostgreSQL is accessible on port 5432
