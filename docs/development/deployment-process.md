# Nova‑XFinity AI — Deployment Process

This document outlines the steps and best practices for deploying Nova‑XFinity AI to staging or production environments.

---

## 1. Deployment Targets

| Environment | Description           |
| ----------- | --------------------- |
| Staging     | Internal testing zone |
| Production  | Public-facing release |

---

## 2. Prerequisites

* All `.env` files configured correctly
* API keys and tokens secured
* Database migrations applied
* Docker & NGINX setup on target server (VPS or cloud)

---

## 3. Build Commands

### Frontend (React + Vite)

```bash
cd frontend
npm run build
```

Output is stored in `/frontend/dist`

### Backend (Node.js)

```bash
cd backend
npx prisma migrate deploy  # optional in future
```

### Auth (FastAPI)

Handled via Docker container (no build step outside image build)

---

## 4. Docker Deployment

Use unified Docker Compose:

```bash
cd nova-xfinity-ai
npm run dev     # for local builds
# or
docker compose up -d --build  # for server deployment
```

---

## 5. Hosting Guidelines

### VPS / Bare Metal

* NGINX reverse proxy (ports 80/443)
* Auto-renewing SSL via Certbot
* Optional PM2 fallback for Node service

### Cloud (Optional)

* Deploy using services like Railway, Render, or DigitalOcean App Platform
* Use managed PostgreSQL when needed

---

## 6. Post-Deploy Checklist

* [ ] Check login flows (OAuth + email)
* [ ] Test dashboard tools + token refresh
* [ ] Confirm invite system + referrals
* [ ] Verify plugin/API sync
* [ ] Check all `/api/v1/*` routes
* [ ] Confirm frontend loads from CDN or NGINX

---

## 7. CDN & Performance (Optional)

* Enable compression of static assets
* Use Cloudflare or BunnyCDN for static + API caching
* Pre-render landing page for SEO

> Last updated: Jan 07, 2026
