# Nova‑XFinity AI — API Routing Map

This document outlines the structure of API endpoints in Nova‑XFinity AI. Routes are grouped by access level and organized under versioned paths (`/api/v1/`).

---

## 1. Base URL

```
/api/v1/
```

All routes are prefixed with `/api/v1/` to support future versioning.

---

## 2. Public Routes

Accessible without authentication:

```
GET    /public/tools           → List available tools
GET    /public/plans           → View pricing plans
POST   /public/contact         → Submit contact form
POST   /public/subscribe       → Newsletter signup
```

---

## 3. Auth Routes (FastAPI)

Handled separately via `/auth/` gateway:

```
POST   /auth/register          → Email registration
POST   /auth/login             → Email login
GET    /auth/oauth/google      → Google login redirect
GET    /auth/oauth/discord     → Discord login redirect
POST   /auth/verify            → Verify email
POST   /auth/reset-request     → Request password reset
POST   /auth/reset             → Submit password reset
```

---

## 4. User (Protected) Routes

Accessible after login with `accessToken`:

```
GET    /user/profile           → Get user details
POST   /user/update            → Update profile
GET    /user/tools             → Get active tools
GET    /user/referrals         → View referrals
POST   /user/claim-reward      → Redeem referral reward
```

---

## 5. Subscription Routes

```
GET    /subscription/status    → View current subscription
POST   /subscription/start     → Start/upgrade plan
POST   /subscription/cancel    → Cancel plan
```

---

## 6. Admin Routes

Restricted to `admin` role:

```
GET    /admin/users            → List users
GET    /admin/usage            → View system-wide usage
POST   /admin/update-role      → Change user role
POST   /admin/block-user       → Ban or restrict user
```

---

## 7. Referral & Invite System

```
GET    /invite/my-codes        → View referral tokens
POST   /invite/generate        → Generate invite token
POST   /invite/redeem          → Redeem invite token
```

---

## 8. Coming Soon (Planned Routes)

```
POST   /tools/ai/voice-editor     → Voice-to-text content editing
POST   /tools/ai/keyword-analyze  → Analyze keywords for SEO
GET    /tools/history             → Retrieve usage history
```

> Last updated: Jan 07, 2026
