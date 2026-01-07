# Nova‑XFinity AI — State Management

This document explains the state management strategy used in the Nova‑XFinity AI frontend application, which is built with React and uses **Riverpod-like** global context patterns (via custom providers).

---

## 1. Overview

State is separated by domain and synchronized with backend services through API calls. It is managed via:

* **Global Context Providers** (custom hooks)
* **Local component state** for UI responsiveness
* **Persistent local storage** for auth/session tokens
* **API-driven sync** for user and tool state

---

## 2. Core State Domains

### 🔐 Auth State

* Stores: `accessToken`, `refreshToken`, `user`, `role`
* Persists via localStorage and refreshes token on load
* Guards private routes based on role

### 🧠 Tools State

* Tracks active tools, usage counters, credit consumption
* Used to display dynamic dashboards
* Synced from `/user/tools` and `/tools/history`

### 💳 Subscription State

* Stores plan details, renewal status, and limits
* Drives access logic for pro tools and features

### 🎁 Referral State

* Stores user invite codes, referred users, rewards
* Connected to referral dashboard and invite flows

---

## 3. Global Provider Structure

```
/frontend/src/context/
├── AuthProvider.js
├── ToolsProvider.js
├── SubscriptionProvider.js
├── ReferralProvider.js
└── GlobalProvider.js (wraps all)
```

---

## 4. Storage & Sync

* Access/refresh tokens stored in localStorage
* All providers re-sync data on login or refresh
* Auto-refresh when navigating between protected pages
* Logout clears all context and localStorage

---

## 5. Planned Enhancements

* Add `SettingsProvider` for UI preferences
* Add caching layer with revalidation (stale-while-revalidate)
* Enable server push for credit usage updates (WebSocket/Firebase)

> Last updated: Jan 07, 2026
