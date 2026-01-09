# UI → Context Mapping

This document maps frontend UI components to their corresponding service logic, API context, and state management layers. Use this guide to understand where each interface gets its data or sends it.

---

## Table of Contents

- [Dashboard](#dashboard)
- [Image Generator](#image-generator)
- [Content Writer](#content-writer)
- [Research Assistant](#research-assistant)
- [Media Hub](#media-hub)
- [Audio Editor](#audio-editor)
- [Account & Subscription](#account--subscription)
- [Settings Panel](#settings-panel)
- [Admin Dashboard](#admin-dashboard)
- [Authentication Pages](#authentication-pages)

---

## Dashboard

**Purpose:** Main landing page showing overview statistics, roadmap, and quick access to features.

### File Path
- `frontend/src/features/dashboard/Dashboard.js`

### Context Provider
- `useAuth()` from `context/AuthContext.js` - User authentication and role checking
- No dedicated dashboard context (uses global auth context)

### Backend API
- **No direct API calls** - Displays static/mock data
- **Planned:** `GET /api/stats/usage` - Usage statistics
- **Planned:** `GET /api/stats/plans` - Plan information

### State Management
- **React Hooks:** `useState` (none), `useEffect` (none)
- **Context:** `AuthContext` (read-only for user role)
- **Local Storage:** None

### Shared Components
- `OnboardingBanner` - Welcome messages and feature introductions
- `ROADMAP_DATA` - Static roadmap data from `constants.js`

### Data Flow
```
AuthContext (user, isAdmin)
  ↓
Dashboard Component
  ↓
Display: Stats cards, roadmap, admin banner
```

---

## Image Generator

**Purpose:** Generate and edit images from text prompts with style and aspect ratio control.

### File Path
- `frontend/src/features/media/ImageGeneration.js`
- `frontend/src/features/media/MediaHubMain.js` (main container)

### Context Provider
- **No dedicated context** - Uses local component state
- **Settings:** Accesses `settings` prop from parent (Writer component when inline)

### Backend API
- `POST /api/media/images` - Generate image
  - **Service:** `backend/src/features/gemini/services/geminiMediaService.js`
  - **Function:** `generateImage(prompt, aspectRatio, style)`
- `POST /api/media/images/edit` - Edit existing image
  - **Service:** `backend/src/features/gemini/services/geminiMediaService.js`
  - **Function:** `editImage(base64ImageData, mimeType, prompt, aspectRatio)`

### State Management
- **React Hooks:**
  - `useState` - `prompt`, `style`, `aspectRatio`, `resultImage`, `loading`, `sourceImage`
  - `useRef` - File input reference
- **Local Storage:** None (images stored in component state)
- **No Context:** Standalone component

### Shared Components
- `MediaHubHeader` - Mode selection (generate/edit/video)
- `MediaHubParameters` - Input controls (prompt, style, aspect ratio)
- `MediaOutput` - Result display with download option
- `MediaPresets` - Quick prompt templates
- `ImageBlock` (Writer integration) - Inline image generation in articles

### Data Flow
```
User Input (prompt, style, aspectRatio)
  ↓
MediaHubMain Component
  ↓
generateImage() / editImage() service call
  ↓
POST /api/media/images
  ↓
Backend: geminiMediaService.generateImage()
  ↓
Response: data:image/png;base64,{data}
  ↓
Display in MediaOutput component
```

---

## Content Writer

**Purpose:** Generate SEO-optimized articles with metadata, outlines, sections, and CTAs.

### File Path
- `frontend/src/features/writer/WriterMain.js` (main component)
- `frontend/src/features/writer/WriterConfig.js` (configuration panel)
- `frontend/src/features/writer/WriterEditor.js` (content editor)
- `frontend/src/features/writer/WriterToolbar.js` (toolbar actions)

### Context Provider
- **No dedicated context** - Uses local component state
- **Settings:** Receives `settings` prop (provider selection, focus keyphrase)

### Backend API
- `POST /api/articles/metadata` - Generate article metadata
  - **Service:** `backend/src/features/gemini/services/geminiWriterService.js`
  - **Function:** `generateMetadata(...)`
- `POST /api/articles/outline` - Generate article outline
  - **Service:** `backend/src/features/gemini/services/geminiWriterService.js`
  - **Function:** `generateOutline(...)`
- `POST /api/articles/section` - Generate section content
  - **Service:** `backend/src/features/gemini/services/geminiWriterService.js`
  - **Function:** `generateSection(...)`
- `POST /api/articles/cta` - Generate CTA block
  - **Service:** `backend/src/features/gemini/services/geminiWriterService.js`
  - **Function:** `generateCTA(...)`
- `POST /api/articles/seo/analyze` - Analyze SEO
  - **Service:** `backend/src/features/gemini/services/geminiSeoService.js`
  - **Function:** `analyzeSEO(content, keywords)`

### State Management
- **React Hooks:**
  - `useState` - `config`, `metadata`, `sections`, `ctaContent`, `analysis`, `loading`, `savedDrafts`
  - `useEffect` - Auto-save drafts every 60 seconds
- **Local Storage:** `nova_xfinity_drafts` - Saved article drafts (max 10)
- **No Context:** Standalone component with local state

### Shared Components
- `WriterConfig` - Article configuration (topic, keywords, type, size, etc.)
- `WriterToolbar` - Actions (analyze SEO, publish, save draft, load draft)
- `WriterEditor` - Content editor with section blocks
- `MetadataCard` - Display article metadata (SEO title, description, keyphrase)
- `SectionBlock` - Individual section with generate button
- `ImageBlock` - Inline image generation within sections
- `CTABlock` - Call-to-action block editor
- `SEOAuditReport` - SEO analysis results display
- `PublishModal` - WordPress publishing interface
- `DraftLibrary` - Saved drafts browser

### Data Flow
```
User Input (topic, keywords, config)
  ↓
WriterMain Component
  ↓
handleStartGeneration()
  ↓
1. generateMetadata() → POST /api/articles/metadata
2. generateOutline() → POST /api/articles/outline
  ↓
Display: MetadataCard + SectionBlock list
  ↓
User clicks "Generate" on section
  ↓
generateSection() → POST /api/articles/section
  ↓
Display: Section content in SectionBlock
  ↓
Auto-save to localStorage every 60s
```

---

## Research Assistant

**Purpose:** Perform research queries with Google Search integration to get real-time, grounded information with citations.

### File Path
- `components/Research.js` (root-level component)

### Context Provider
- **No dedicated context** - Uses local component state
- **Auth:** May use `useAuth()` for user ID tracking (planned)

### Backend API
- `POST /api/research/query` - Perform research query
  - **Service:** `backend/src/features/providers/gemini/services/ResearchService.js`
  - **Function:** `performResearch(userId, query)`

### State Management
- **React Hooks:**
  - `useState` - `query`, `loading`, `statusMsg`, `results`
- **Local Storage:** None
- **No Context:** Standalone component

### Shared Components
- `OnboardingBanner` - Welcome message and feature introduction
- `Tooltip` - Help text for input fields

### Data Flow
```
User Input (research query)
  ↓
Research Component
  ↓
handleResearch()
  ↓
performResearch() → POST /api/research/query
  ↓
Backend: ResearchService.performResearch()
  ↓
Response: { summary, sources: [{ title, uri }] }
  ↓
Display: Research synthesis + source links
```

---

## Media Hub

**Purpose:** Unified interface for image generation, video generation, and audio/TTS generation.

### File Path
- `frontend/src/features/media/MediaHubMain.js` (main container)
- `frontend/src/features/media/ImageGeneration.js` (image mode)
- `frontend/src/features/media/VideoGeneration.js` (video mode)
- `frontend/src/features/media/AudioBlock.js` (audio mode)

### Context Provider
- **No dedicated context** - Uses local component state
- **Settings:** May access global settings for API keys (planned)

### Backend API
- `POST /api/media/images` - Generate image
  - **Service:** `backend/src/features/gemini/services/geminiMediaService.js`
- `POST /api/media/videos` - Generate video
  - **Service:** `backend/src/features/gemini/services/geminiMediaService.js`
  - **Function:** `generateVideo(prompt, style, resolution, aspectRatio, duration, startFrameBase64)`
- `POST /api/media/audio` - Generate audio/TTS (planned)
  - **Service:** `backend/src/features/gemini/services/geminiMediaService.js`
  - **Function:** `generateAudio(text, voice)`

### State Management
- **React Hooks:**
  - `useState` - `mode`, `loading`, `prompt`, `style`, `aspect`, `duration`, `resolution`, `resultImage`, `resultVideo`, `resultAudio`, `sourceImage`, `statusMessage`
  - `useRef` - `fileInputRef`, `audioContextRef` (for audio playback)
- **Local Storage:** None
- **No Context:** Standalone component

### Shared Components
- `MediaHubHeader` - Mode selector (generate/edit/video)
- `MediaHubParameters` - Input controls (prompt, style, aspect ratio, duration, etc.)
- `MediaOutput` - Result display (image/video/audio player)
- `MediaPresets` - Quick prompt templates
- `ImageEditor` - Image editing interface (edit mode)
- `VideoEditor` - Video editing interface (video mode)
- `AudioBlock` - Audio playback interface (audio mode)

### Data Flow
```
User selects mode (generate/edit/video)
  ↓
MediaHubMain Component
  ↓
User inputs prompt and parameters
  ↓
handleGenerate() / handleEdit() / handleVideoGenerate()
  ↓
Service call → POST /api/media/{images|videos|audio}
  ↓
Backend: geminiMediaService.{generateImage|editImage|generateVideo|generateAudio}()
  ↓
Response: Base64 data URI or video URL
  ↓
Display in MediaOutput component
```

---

## Audio Editor

**Purpose:** Generate and edit audio content using text-to-speech (TTS) and audio processing.

### File Path
- `frontend/src/features/media/AudioBlock.js`
- Integrated in `MediaHubMain.js` (audio mode)

### Context Provider
- **No dedicated context** - Uses local component state
- **Audio Context:** Web Audio API `AudioContext` (via `useRef`)

### Backend API
- `POST /api/media/audio` - Generate TTS audio (planned)
  - **Service:** `backend/src/features/gemini/services/geminiMediaService.js`
  - **Function:** `generateAudio(text, voice)`

### State Management
- **React Hooks:**
  - `useState` - `text`, `voice`, `resultAudio`, `loading`, `isPlaying`
  - `useRef` - `audioContextRef` (Web Audio API context)
- **Local Storage:** None
- **No Context:** Standalone component

### Shared Components
- `MediaHubParameters` - Text input and voice selection
- `MediaOutput` - Audio player display
- Audio utilities: `decodeBase64()`, `decodeAudioData()` from `geminiMediaService.js`

### Data Flow
```
User Input (text, voice selection)
  ↓
AudioBlock Component
  ↓
generateAudio() → POST /api/media/audio
  ↓
Response: data:audio/pcm;base64,{data}
  ↓
Decode via Web Audio API
  ↓
Play audio or display player
```

---

## Account & Subscription

**Purpose:** Display account information, subscription status, usage statistics, and plan management.

### File Path
- `components/Account/AccountPage.js` (main account page)
- `frontend/src/features/account/Subscription.js` (subscription management)
- `frontend/src/features/account/UsageStats.js` (usage statistics)
- `frontend/src/features/account/PlanComparison.js` (plan comparison)
- `frontend/src/features/account/UpgradeModal.js` (upgrade modal)

### Context Provider
- `useAuth()` from `context/AuthContext.js` - User information
- `useQuota()` from `hooks/useQuota.js` - Usage quota tracking (planned)

### Backend API
- `GET /api/subscription/status` - Get subscription status
  - **Service:** `backend/src/features/subscription/services/subscription.service.js`
- `GET /api/subscription/usage` - Get usage statistics
  - **Service:** `backend/src/features/subscription/services/subscription.service.js`
- `GET /api/subscription/limits` - Get plan limits
  - **Service:** `backend/src/features/subscription/services/subscription.service.js`
- `POST /api/subscription/checkout` - Create Stripe checkout session
  - **Service:** `backend/src/features/subscription/services/subscription.service.js`
- `POST /api/subscription/portal` - Access Stripe customer portal
  - **Service:** `backend/src/features/subscription/services/subscription.service.js`
- `POST /api/subscription/cancel` - Cancel subscription
  - **Service:** `backend/src/features/subscription/services/subscription.service.js`

### State Management
- **React Hooks:**
  - `useState` - `subscription`, `usage`, `loading`, `showUpgradeModal`
  - `useEffect` - Load account data on mount
- **Local Storage:** None
- **Context:** `AuthContext` (read-only for user info)

### Shared Components
- `SubscriptionCard` - Subscription status display
- `UsageStats` - Usage statistics (articles, images, videos, research)
- `PlanComparison` - Plan feature comparison table
- `UpgradeModal` - Upgrade/payment modal
- `PlanBadge` - Plan tier badge display
- `UsageProgress` - Usage progress bars

### Data Flow
```
AccountPage Component mounts
  ↓
useEffect: loadAccountData()
  ↓
GET /api/subscription/status
GET /api/subscription/usage
  ↓
Display: SubscriptionCard + UsageStats
  ↓
User clicks "Upgrade"
  ↓
POST /api/subscription/checkout
  ↓
Redirect to Stripe checkout
```

---

## Settings Panel

**Purpose:** Configure AI provider settings, API keys (admin only), and application preferences.

### File Path
- `components/Settings/SettingsPanel.js`

### Context Provider
- `useSettings()` from `context/SettingsContext.js` - Application settings
- `useTheme()` from `context/ThemeContext.js` - Theme preferences
- `useAuth()` from `context/AuthContext.js` - User role (for API key access)

### Backend API
- **No direct API calls** - Settings stored in localStorage
- **Planned:** `PUT /api/users/settings` - Sync settings to backend

### State Management
- **React Hooks:**
  - `useState` - `settings` (from props), local form state
  - `useEffect` - Persist to localStorage
- **Local Storage:** `nova_xfinity_settings` - User settings (provider, focus keyphrase, etc.)
- **Context:** 
  - `SettingsContext` - Language, editor mode
  - `ThemeContext` - Theme (dark/light)

### Shared Components
- `CustomDropdown` - Provider selection dropdown
- Input components for API keys (admin only)

### Data Flow
```
SettingsPanel Component
  ↓
Load settings from localStorage
  ↓
User modifies settings
  ↓
onSettingsChange() → Update parent state
  ↓
Save to localStorage
  ↓
(Planned) Sync to backend via PUT /api/users/settings
```

---

## Admin Dashboard

**Purpose:** Administrative interface for system monitoring, user management, and analytics.

### File Path
- `frontend/src/features/admin-dashboard/AdminDashboard.js`

### Context Provider
- `useAuth()` from `context/AuthContext.js` - User role checking (admin only)

### Backend API
- `GET /api/stats/usage` - System-wide usage statistics
  - **Service:** `backend/src/features/stats/controllers/stats.controller.js`
- `GET /api/stats/plans` - Plan distribution statistics
  - **Service:** `backend/src/features/stats/controllers/stats.controller.js`
- `GET /api/stats/failures` - Generation failure statistics
  - **Service:** `backend/src/features/stats/controllers/stats.controller.js`
- **Planned:** User management endpoints

### State Management
- **React Hooks:**
  - `useState` - `stats`, `loading`, `selectedPeriod`
  - `useEffect` - Load stats on mount
- **Local Storage:** None
- **Context:** `AuthContext` (read-only for admin check)

### Shared Components
- Statistics cards and charts (planned)
- User management table (planned)
- System health indicators (planned)

### Data Flow
```
AdminDashboard Component mounts
  ↓
Check: user.role === 'admin'
  ↓
Load admin statistics
  ↓
GET /api/stats/usage
GET /api/stats/plans
GET /api/stats/failures
  ↓
Display: Admin dashboard with statistics
```

---

## Authentication Pages

**Purpose:** User authentication (login, register, password reset, email verification).

### File Path
- `frontend/src/features/auth/Login.js`
- `frontend/src/features/auth/Register.js`
- `frontend/src/features/auth/ForgotPassword.js`
- `frontend/src/features/auth/ResetPassword.js`
- `frontend/src/features/auth/VerifyEmail.js`
- `frontend/src/features/auth/Unauthorized.js`

### Context Provider
- `useAuth()` from `context/AuthContext.js` - Authentication state and methods
  - Methods: `login()`, `register()`, `logout()`, `loginWithProvider()`

### Backend API
- `POST /auth/login` - User login
  - **Service:** `backend-auth/app.py` (FastAPI)
- `POST /auth/register` - User registration
  - **Service:** `backend-auth/app.py` (FastAPI)
- `POST /auth/forgot-password` - Request password reset
  - **Service:** `backend-auth/app.py` (FastAPI)
- `POST /auth/reset-password` - Reset password with token
  - **Service:** `backend-auth/app.py` (FastAPI)
- `GET /auth/verify-email/{token}` - Verify email address
  - **Service:** `backend-auth/app.py` (FastAPI)
- `GET /auth/{provider}` - OAuth provider login (Google, GitHub, etc.)
  - **Service:** `backend-auth/app.py` (FastAPI)
- `GET /users/me` - Get current user info
  - **Service:** `backend-auth/app.py` (FastAPI)

### State Management
- **React Hooks:**
  - `useState` - Form fields, `loading`, `error`
  - `useEffect` - Check auth status on mount
- **Local Storage:** None (tokens stored in cookies)
- **Context:** `AuthContext` - Full authentication state

### Shared Components
- `AuthLayout` - Common authentication page layout
- Form input components
- OAuth provider buttons

### Data Flow
```
User submits login form
  ↓
Login Component
  ↓
auth.login(email, password)
  ↓
POST /auth/login
  ↓
Response: { access_token, user }
  ↓
Store token in cookie
  ↓
Update AuthContext
  ↓
Redirect to dashboard
```

---

## Global Context Providers

### AuthContext
- **File:** `context/AuthContext.js`
- **Provides:** `user`, `isAuthenticated`, `loading`, `login()`, `register()`, `logout()`, `loginWithProvider()`, `isAdmin`
- **Used By:** All protected pages, Dashboard, Admin Dashboard, Account Page

### SettingsContext
- **File:** `frontend/src/context/SettingsContext.js`
- **Provides:** `language`, `editorMode`, `settings`, `updateSettings()`
- **Used By:** Settings Panel, Writer (planned)

### ThemeContext
- **File:** `frontend/src/context/ThemeContext.js`
- **Provides:** `theme`, `toggleTheme()`
- **Used By:** Settings Panel, Global theme toggle

---

## API Client Service

### File Path
- `frontend/src/services/api.js`

### Purpose
Centralized Axios instance for making HTTP requests to the backend API.

### Features
- Automatic authentication token injection from cookies
- Automatic cookie handling for CORS requests
- Response error handling with 401 redirect logic
- Configurable base URL via `VITE_API_URL` environment variable

### Usage
```javascript
import api from '@/services/api.js';

// GET request
const response = await api.get('/api/articles');

// POST request
const result = await api.post('/api/articles/metadata', {
  topic: 'React Hooks',
  keywords: ['react', 'hooks']
});
```

### Interceptors
- **Request:** Adds `Authorization: Bearer {token}` header from cookies
- **Response:** Handles 401 errors by clearing tokens and redirecting to login

---

## State Management Summary

### Context-Based State
- **AuthContext:** User authentication, login/logout, OAuth
- **SettingsContext:** Application settings (language, editor mode)
- **ThemeContext:** Theme preferences (dark/light)

### Local Component State
- **Writer:** Article content, sections, metadata, drafts
- **Media Hub:** Media generation parameters, results
- **Research:** Query, results, loading state
- **Dashboard:** Static/mock data (no state)

### LocalStorage
- `nova_xfinity_settings` - User settings (provider, focus keyphrase)
- `nova_xfinity_drafts` - Saved article drafts (max 10)
- `nova-xfinity-theme` - Theme preference
- `nova-xfinity-settings` - Application settings

### Cookies
- `access_token` - JWT authentication token (set by backend)
- `refresh_token` - Refresh token (if implemented)

---

## Related Documentation

- [Service Prompt Structures](../prompts/service-prompts.md) - AI service prompt formats
- [AI Service Flow](../planning/ai-service-flow.md) - Backend service architecture
- [Frontend Architecture](../architecture/frontend-architecture.md) - Frontend structure
- [API Routing Map](../architecture/api-routing-map.md) - Backend API endpoints
