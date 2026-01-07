# Nova‑XFinity AI — Auth System

This document outlines the complete authentication system architecture for Nova‑XFinity AI, including login flows, token management, OAuth integrations, and role-based access control.

---

## 1. Overview

The authentication system is hybrid and modular, combining **OAuth (Google, Discord)** with **email/password authentication**. It uses:

* **FastAPI Auth Service** (Python) for token handling and verification
* **JWT-based tokens** for session management
* **Role-based access control (RBAC)** for gated feature access

---

## 2. Auth Flow

### Email/Password Login

* User submits email + password
* FastAPI issues accessToken + refreshToken
* Verification email sent if first-time login

### OAuth Login (Google / Discord)

* Frontend redirects user to provider auth URL
* Backend handles callback, token exchange, and user creation or update
* Session initialized with access + refresh tokens

---

## 3. Tokens

* `accessToken` — short-lived (15 min), used in API headers
* `refreshToken` — longer-lived (7 days), stored in secure cookies
* Refresh flow renews access token without re-login

---

## 4. Role Management

Roles are assigned on the backend and injected into JWT:

* `free`: default user with limited access
* `pro`: upgraded user with full tools
* `admin`: platform manager with dashboard access

RBAC middleware gates routes based on roles.

---

## 5. Security Considerations

* OAuth state & nonce protection
* CSRF protection for token endpoints
* Rate limiting on login + password reset
* Secure cookie flags: HttpOnly, Secure, SameSite=Lax
* Invalid/expired tokens redirect to `/login`

---

## 6. Planned Enhancements

* Add SSO federation layer (Phase 2)
* Add Apple login option
* Allow custom token lifespan in admin UI
* View login activity and session history

> Last updated: Jan 07, 2026
