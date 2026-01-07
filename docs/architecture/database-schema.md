# Nova‑XFinity AI — Database Schema

This document outlines the core database schema structure for Nova‑XFinity AI, including primary entities, relationships, and planned extensions. The database is implemented using **PostgreSQL**.

---

## 1. Overview

The platform uses a single unified database with tables accessed by both the Node.js API and the FastAPI Auth backend. Prisma is used for initial schema management (to be replaced in future versions).

---

## 2. Core Tables

### 🧑 Users

* `id` (UUID, PK)
* `email` (unique)
* `password_hash`
* `role` (`free`, `pro`, `admin`)
* `created_at`, `last_login`
* `oauth_provider`, `oauth_id`

### 💳 Subscriptions

* `id` (UUID, PK)
* `user_id` (FK → Users)
* `plan` (monthly, yearly, gift)
* `status` (active, expired, trial)
* `renewal_date`, `payment_method`

### 🧠 ToolUsage

* `id` (UUID, PK)
* `user_id` (FK → Users)
* `tool_name`
* `credits_used`
* `timestamp`

### 🎁 Referrals

* `id` (UUID, PK)
* `referrer_id` (FK → Users)
* `referred_id` (FK → Users)
* `reward_type` (pro_days, credits)
* `redeemed` (boolean)
* `created_at`

### 📦 InviteTokens

* `token` (unique string, PK)
* `referrer_id` (FK → Users)
* `type` (gift, pro, public)
* `used_by_id` (nullable FK → Users)
* `expires_at`, `created_at`

---

## 3. Auxiliary Tables

### 📬 EmailVerifications

* `id`, `user_id`, `token`, `expires_at`, `verified_at`

### 🔒 ResetRequests

* `id`, `user_id`, `token`, `requested_at`, `used_at`

### 🔐 Sessions

* `id`, `user_id`, `access_token`, `refresh_token`, `created_at`, `expires_at`

---

## 4. Planned Tables (Q2‑Q3)

* `AdminLogs` — action tracking (bans, updates, promotions)
* `Feedback` — user feedback entries
* `ContentDrafts` — saved WordPress/Chrome plugin drafts
* `ChromeAuthLinks` — plugin/device-based login tokens

---

## 5. Docker Setup

### Docker Compose Configuration

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: finity-postgres
    environment:
      POSTGRES_USER: finity
      POSTGRES_PASSWORD: finity_password
      POSTGRES_DB: finity_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - finity-network

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: finity-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@finity.ai
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres
    networks:
      - finity-network

  redis:
    image: redis:7-alpine
    container_name: finity-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - finity-network

volumes:
  postgres_data:
  redis_data:

networks:
  finity-network:
    driver: bridge
```

### Connection Strings

**Development:**
```
DATABASE_URL=postgresql://finity:finity_password@localhost:5432/finity_db?schema=public
REDIS_URL=redis://localhost:6379
```

**Production:**
Use environment variables for secure connection strings.

---

## 6. Prisma Schema Management

The database schema is managed using Prisma ORM:

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Migrations

**Creating Migrations:**
```bash
# Generate migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy
```

### Migration Best Practices

1. Always create migrations for schema changes
2. Test migrations on development first
3. Backup database before production migrations
4. Use descriptive migration names
5. Review generated SQL before applying

---

## 7. Indexes & Performance

### Performance Indexes

- **Users**: `email` (unique), `emailToken` (for verification lookups)
- **Subscriptions**: `user_id` (foreign key), `status` (filtering)
- **ToolUsage**: `user_id` (foreign key), `timestamp` (sorting)
- **Referrals**: `referrer_id`, `referred_id` (foreign keys)

### Query Optimization

1. Use indexes for frequently queried fields
2. Limit results with pagination
3. Select specific fields (avoid `SELECT *`)
4. Use joins efficiently
5. Batch operations with transactions

---

## 8. Connection Pooling

**Prisma Connection Pool:**
```env
DATABASE_URL=postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20
```

**Recommended Settings:**
- Connection limit: 10-20 connections
- Pool timeout: 20 seconds
- Idle timeout: 10 minutes

---

**Note:** Content merged from `database.md` (deleted) - Jan 07, 2026

> Last updated: Jan 07, 2026
