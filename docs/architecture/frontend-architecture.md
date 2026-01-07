# Frontend Architecture

## Overview

The frontend is built with React 19 and uses HTM (HTML-in-JS) for templating. The architecture follows a feature-based modular structure, promoting code reusability and maintainability.

## Project Structure

```
src/
├── features/              # Feature-based modules
│   ├── writer/
│   │   ├── components/
│   │   │   ├── WriterMain.js
│   │   │   ├── WriterConfig.js
│   │   │   └── WriterWorkspace.js
│   │   ├── hooks/
│   │   │   └── useWriterState.js
│   │   ├── utils/
│   │   │   └── draftManager.js
│   │   └── services/
│   │       └── articleService.js
│   ├── research/
│   │   ├── components/
│   │   │   ├── ResearchMain.js
│   │   │   └── ResearchResults.js
│   │   └── hooks/
│   │       └── useResearch.js
│   ├── media/
│   │   ├── components/
│   │   │   ├── MediaHubMain.js
│   │   │   ├── ImageGenerator.js
│   │   │   ├── VideoGenerator.js
│   │   │   └── MediaPreview.js
│   │   └── hooks/
│   │       └── useMediaGeneration.js
│   ├── dashboard/
│   │   └── components/
│   │       └── Dashboard.js
│   └── auth/
│       ├── components/
│       │   ├── Login.js
│       │   ├── Register.js
│       │   └── PasswordReset.js
│       └── hooks/
│           └── useAuth.js
├── shared/               # Shared components and utilities
│   ├── components/
│   │   ├── Button3D.js
│   │   ├── Card3D.js
│   │   ├── Input3D.js
│   │   ├── GlassPanel.js
│   │   └── AnimatedBackground.js
│   ├── hooks/
│   │   ├── useLocalStorage.js
│   │   └── useApi.js
│   ├── utils/
│   │   ├── formatters.js
│   │   └── validators.js
│   └── constants/
│       └── constants.js
├── core/                 # Core functionality
│   ├── api/
│   │   ├── client.js     # API client setup
│   │   └── endpoints.js  # API endpoints
│   ├── auth/
│   │   ├── AuthContext.js
│   │   └── authService.js
│   └── config/
│       └── config.js
├── App.js                # Root component
├── index.js              # Entry point
└── index.html            # HTML template
```

## Component Architecture

### Component Types

1. **Container Components** - Manage state and business logic
2. **Presentational Components** - Pure UI components
3. **Feature Components** - Feature-specific components
4. **Shared Components** - Reusable UI elements

### Component Structure Example

```javascript
// features/writer/components/WriterConfig.js
import React, { useState } from 'react';
import htm from 'htm';
import { CustomDropdown } from '../../../shared/components';
import { useWriterState } from '../hooks/useWriterState';

const html = htm.bind(React.createElement);

const WriterConfig = () => {
  const { config, updateConfig } = useWriterState();
  
  return html`
    <div className="config-panel">
      <!-- Configuration UI -->
    </div>
  `;
};

export default WriterConfig;
```

## State Management

### Current Approach: Context API

**Auth Context:**
```javascript
// core/auth/AuthContext.js
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Auth methods
  
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Planned: Zustand (Optional)

For more complex state management:
```javascript
// stores/writerStore.js
import create from 'zustand';

export const useWriterStore = create((set) => ({
  config: {},
  metadata: null,
  sections: [],
  updateConfig: (config) => set({ config }),
  // ...
}));
```

## Feature Modules

### Writer Module

**Structure:**
```
writer/
├── components/
│   ├── WriterMain.js      # Main container
│   ├── WriterConfig.js    # Configuration form
│   └── WriterWorkspace.js # Editor workspace
├── hooks/
│   └── useWriterState.js  # State management
├── utils/
│   └── draftManager.js    # Draft operations
└── services/
    └── articleService.js  # API calls
```

**Responsibilities:**
- Article configuration
- Content generation
- Draft management
- SEO optimization

### Research Module

**Structure:**
```
research/
├── components/
│   ├── ResearchMain.js    # Main component
│   └── ResearchResults.js # Results display
└── hooks/
    └── useResearch.js     # Research logic
```

**Responsibilities:**
- Research queries
- Result display
- Source citations
- Query history

### Media Module

**Structure:**
```
media/
├── components/
│   ├── MediaHubMain.js    # Main container
│   ├── ImageGenerator.js  # Image generation
│   ├── VideoGenerator.js  # Video generation
│   └── MediaPreview.js    # Preview component
└── hooks/
    └── useMediaGeneration.js
```

**Responsibilities:**
- Image generation
- Video generation
- Audio generation
- Media preview

## API Integration

### API Client

```javascript
// core/api/client.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle token refresh, etc.
    return Promise.reject(error);
  }
);

export default apiClient;
```

### API Hooks

```javascript
// shared/hooks/useApi.js
import { useState, useEffect } from 'react';
import apiClient from '../../core/api/client';

export const useApi = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // API call logic
  }, [endpoint]);

  return { data, loading, error, refetch };
};
```

## Routing

**Current:** Simple tab-based navigation in `App.js`

**Planned:** React Router integration
```javascript
// App.js with React Router
import { BrowserRouter, Routes, Route } from 'react-router-dom';

<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/writer" element={<Writer />} />
  <Route path="/research" element={<Research />} />
  <Route path="/media" element={<MediaHub />} />
  <Route path="/settings" element={<Settings />} />
</Routes>
```

## Styling

### Tailwind CSS

**Configuration:**
- CDN version (current)
- Custom configuration file (planned)

**Design Tokens:**
```javascript
// tailwind.config.js (planned)
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          900: '#1e3a8a',
          600: '#2563eb',
          500: '#3b82f6',
        },
        // ...
      },
    },
  },
};
```

### 3D Components

**Button3D:**
```javascript
// shared/components/Button3D.js
const Button3D = ({ children, onClick, variant = 'primary' }) => {
  return html`
    <button
      className="button-3d"
      onClick=${onClick}
      style=${{
        transform: 'translateZ(0)',
        transition: 'transform 0.3s ease',
      }}
    >
      ${children}
    </button>
  `;
};
```

## Error Handling

### Error Boundary

```javascript
// shared/components/ErrorBoundary.js
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to error tracking service
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return html`<div>Something went wrong</div>`;
    }
    return this.props.children;
  }
}
```

## Performance Optimization

### Code Splitting

```javascript
// Lazy loading components
const Writer = React.lazy(() => import('./features/writer/WriterMain'));
const Research = React.lazy(() => import('./features/research/ResearchMain'));

// Suspense wrapper
<Suspense fallback={<Loading />}>
  <Writer />
</Suspense>
```

### Memoization

```javascript
// Memoize expensive components
const MemoizedComponent = React.memo(({ data }) => {
  // Component logic
});
```

### Virtual Scrolling

For long lists, use `react-window` or `react-virtualized`.

## Testing Strategy

**Component Tests:**
- React Testing Library
- Jest for unit tests

**E2E Tests:**
- Playwright or Cypress

**Test Structure:**
```
src/
├── features/
│   └── writer/
│       ├── components/
│       │   └── WriterConfig.test.js
│       └── hooks/
│           └── useWriterState.test.js
```

## Build & Deployment

### Development
```bash
npm run dev  # Vite dev server with HMR
```

### Production Build
```bash
npm run build  # Vite production build
npm run preview  # Preview production build
```

### Build Output
- Static files in `dist/`
- Optimized and minified
- Code splitting
- Asset optimization

## Next Steps

- Review [Design System](../design/design-system.md) for UI/UX guidelines
- Check [Code Organization](../development/code-organization.md) for structure details
- See [API Documentation](api.md) for API integration patterns
