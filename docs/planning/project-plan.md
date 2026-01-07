# Nova-XFinity AI — Project Plan

## 1. Project Overview

Nova-XFinity AI is an AI-powered content generation platform that delivers SEO-optimized articles, plugin integration with WordPress, and an evolving ecosystem of tools for creators, marketers, and developers. It includes a Web App, WordPress Plugin, and plans for Chrome Extension and public APIs.

---

## 2. Core Features & Modules

### 2.1 AI-Powered Content Tools

* SEO Article Writer
* AI Research Assistant
* Pulse Mode (RSS → AI Posts)
* Coming Soon: Multi-provider fallback

### 2.2 WordPress Plugin

* Direct sync with WP REST API
* Auto-draft articles with AI
* Plugin UI and admin controls

### 2.3 Chrome Extension *(Planned)*

* Contextual content suggestions
* Article generation while browsing

### 2.4 Account System

* Free, Pro, Admin roles
* OAuth: Google, Discord
* Email verification and password login

### 2.5 Referral & Gift System

* Invite friends
* Unlock Pro gift accounts
* Promo campaign support

---

## 3. Public Website Pages

### 3.1 Core Pages

* Landing Page
* About Us
* Contact & Newsletter
* Blog

### 3.2 Legal Pages

* Privacy Policy
* Terms of Service
* Return & Refund Policy
* Cookie Policy

### 3.3 Support Pages

* FAQ
* Help Center
* Troubleshooting

### 3.4 Growth Pages

* Invite Friends
* Referral Terms
* Gift Activation
* Marketing Campaigns

---

## 4. Admin Panel (Phase 2)

* User management
* Subscription analytics
* Referral tracking
* Tool usage logs

---

## 5. Infrastructure & Tech Stack

* Frontend: React + Vite
* Backend: Node.js (services) + FastAPI (auth)
* Database: PostgreSQL
* Dev: Dockerized with `docker-compose.yml`
* State: Local + Cloud sync

---

## 6. Documentation Structure

* `/docs/architecture/`
* `/docs/development/`
* `/docs/design/`
* `/docs/integrations/`
* `/docs/troubleshooting/`
* `/docs/archive/`
* `/docs/planning/project-plan.md`

---

## 7. Beta Release Checklist

### ✅ Completed

* Landing Page design and layout
* OAuth implementation (Google, Discord)
* User role system (Free, Pro, Admin)
* Environment setup and Docker orchestration
* Referral system logic and database tables
* Branding and renaming to Nova‑XFinity AI
* Master OAuth Fixes Log
* Docs cleanup and reorganization

### ⏳ In Progress

* Public pages scaffolding (`/frontend/src/pages/...`)
* Contact & Newsletter forms
* WordPress Plugin final polish and tests
* Core content for Blog, FAQ, and Help

### 🔒 Security & QA

* Session and token protection (JWT, expiry, refresh)
* Private route guard audit (frontend + backend)
* Form validation and sanitization (Contact, Auth)
* OAuth failover and error reporting

### 🛠️ Final Tasks Before Beta

* Connect plugin API endpoints to live backend
* Seed initial Blog and FAQ content
* Add sitemap and metadata tags (SEO)
* Add feedback survey form (e.g., Typeform or internal)
* Compress and optimize images/assets
* Verify UI responsiveness and accessibility

> 📅 Target: Beta Launch — Q1 2026
