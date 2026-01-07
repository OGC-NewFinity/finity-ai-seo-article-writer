# Open Source Resources

## Overview

This document lists all open-source templates, libraries, and resources used in the Nova‑XFinity AI Article Writer project.

## Authentication Templates

### React Auth Template

**Repository:** https://github.com/arifszn/react-auth-template

**Features:**
- Login form
- Registration form
- Forgot password
- Email verification
- Password reset
- Responsive design

**Tech Stack:**
- React
- React Router
- Axios
- Form validation

**Integration:**
- Copy login/register components
- Adapt to project structure
- Use with AuthContext

### React Login Form

**Repository:** https://github.com/mdbootstrap/react-login-form

**Features:**
- Multiple login form designs
- Bootstrap 5 styling
- Responsive layouts
- Animation effects

**Usage:**
- Extract form designs
- Convert to Tailwind CSS
- Integrate with auth system

### NextAuth.js (Reference)

**Website:** https://next-auth.js.org/

**Features:**
- Multiple auth providers
- Session management
- JWT support
- OAuth integration

**Note:** For Next.js, but patterns can be adapted to React.

## Email Templates

### React Email Templates

**Website:** https://react.email/templates

**Features:**
- Pre-built email templates
- React Email components
- Responsive designs
- Professional layouts

**Templates Available:**
- Welcome email
- Password reset
- Invoice
- Notification
- Newsletter

**Usage:**
```bash
npm install react-email @react-email/components
```

### React Emails Pro

**Website:** https://www.reactemailspro.com/

**Features:**
- Premium email templates
- Ready to use
- Modern designs
- Conversion optimized

**Note:** Some templates are paid, check licensing.

### Mailgun Transactional Templates

**Repository:** https://github.com/mailgun/transactional-email-templates

**Features:**
- HTML/CSS templates
- Responsive designs
- Professional layouts
- Free to use

**Usage:**
- Convert HTML to React Email
- Customize styling
- Integrate with email service

## UI Component Libraries

### React Three Fiber

**Repository:** https://github.com/pmndrs/react-three-fiber

**Purpose:** 3D graphics and animations

**Features:**
- React renderer for Three.js
- Declarative 3D components
- Hooks-based API

**Usage:**
```bash
npm install @react-three/fiber three
```

### Framer Motion

**Repository:** https://github.com/framer/motion

**Purpose:** Animations

**Features:**
- Declarative animations
- Gesture support
- Layout animations
- Spring physics

**Usage:**
```bash
npm install framer-motion
```

### React Window

**Repository:** https://github.com/bvaughn/react-window

**Purpose:** Virtual scrolling for large lists

**Features:**
- Efficient rendering
- Fixed/variable sizes
- Horizontal/vertical scrolling

**Usage:**
```bash
npm install react-window
```

## Admin Dashboards

### React Dashboards Collection

**Repository:** https://github.com/admin-dashboards/react-dashboards

**Features:**
- Multiple dashboard templates
- Component examples
- Layout patterns

**Templates:**
- Material-UI dashboards
- Tailwind CSS dashboards
- Bootstrap dashboards

## Form Libraries

### React Hook Form

**Repository:** https://github.com/react-hook-form/react-hook-form

**Purpose:** Form management

**Features:**
- Minimal re-renders
- Built-in validation
- TypeScript support
- Small bundle size

**Usage:**
```bash
npm install react-hook-form
```

### Zod

**Repository:** https://github.com/colinhacks/zod

**Purpose:** Schema validation

**Features:**
- TypeScript-first
- Runtime validation
- Composable schemas

**Usage:**
```bash
npm install zod
```

## API Client Libraries

### Axios

**Repository:** https://github.com/axios/axios

**Purpose:** HTTP client

**Features:**
- Promise-based
- Request/response interceptors
- Automatic JSON handling
- Request cancellation

**Usage:**
```bash
npm install axios
```

## State Management

### Zustand

**Repository:** https://github.com/pmndrs/zustand

**Purpose:** State management

**Features:**
- Minimal boilerplate
- Small bundle size
- TypeScript support
- No providers needed

**Usage:**
```bash
npm install zustand
```

## Utility Libraries

### Date-fns

**Repository:** https://github.com/date-fns/date-fns

**Purpose:** Date manipulation

**Features:**
- Immutable
- Tree-shakeable
- TypeScript support
- Locale support

**Usage:**
```bash
npm install date-fns
```

### Lodash

**Repository:** https://github.com/lodash/lodash

**Purpose:** Utility functions

**Features:**
- Common utilities
- Performance optimized
- Modular imports

**Usage:**
```bash
npm install lodash
# Or individual functions
npm install lodash.debounce
```

## Icons

### Font Awesome

**Website:** https://fontawesome.com/

**Usage:**
- CDN version (current)
- React components available
- Free and Pro versions

### React Icons

**Repository:** https://github.com/react-icons/react-icons

**Features:**
- Multiple icon sets
- Tree-shakeable
- Easy to use

**Usage:**
```bash
npm install react-icons
```

## Testing

### React Testing Library

**Repository:** https://github.com/testing-library/react-testing-library

**Purpose:** Component testing

**Features:**
- User-centric testing
- Accessible queries
- Lightweight

**Usage:**
```bash
npm install --save-dev @testing-library/react
```

### Vitest

**Repository:** https://github.com/vitest-dev/vitest

**Purpose:** Unit testing

**Features:**
- Vite-native
- Fast execution
- TypeScript support

**Usage:**
```bash
npm install --save-dev vitest
```

## Code Quality

### ESLint

**Repository:** https://github.com/eslint/eslint

**Purpose:** Linting

**Usage:**
```bash
npm install --save-dev eslint
```

### Prettier

**Repository:** https://github.com/prettier/prettier

**Purpose:** Code formatting

**Usage:**
```bash
npm install --save-dev prettier
```

## Backend Resources

### Express.js

**Website:** https://expressjs.com/

**Purpose:** Web framework

### Prisma

**Website:** https://www.prisma.io/

**Purpose:** ORM

**Features:**
- Type-safe queries
- Migration system
- Database agnostic

### Bull (Job Queue)

**Repository:** https://github.com/OptimalBits/bull

**Purpose:** Job processing

**Features:**
- Redis-backed
- Retry logic
- Priority queues

## Docker Resources

### Docker Compose Templates

**Repository:** https://github.com/docker/awesome-compose

**Features:**
- PostgreSQL setup
- Redis setup
- Node.js + PostgreSQL
- Development environments

## Design Resources

### Tailwind UI Components

**Website:** https://tailwindui.com/

**Features:**
- Premium components
- Copy-paste ready
- Professional designs

**Note:** Paid, but high quality.

### Headless UI

**Repository:** https://github.com/tailwindlabs/headlessui

**Features:**
- Accessible components
- Unstyled by default
- Works with Tailwind

**Usage:**
```bash
npm install @headlessui/react
```

## Documentation

### MDX

**Website:** https://mdxjs.com/

**Purpose:** Markdown with JSX

**Features:**
- Write docs in markdown
- Embed React components
- Custom components

## Summary

### Frontend Stack
- React 19
- Vite
- Tailwind CSS
- HTM
- React Three Fiber (for 3D)
- Framer Motion (for animations)

### Backend Stack
- Node.js
- Express.js
- Prisma
- PostgreSQL
- Redis
- Bull (queues)

### Development Tools
- ESLint
- Prettier
- Vitest
- React Testing Library

### External Services
- Google Gemini API
- OpenAI API (optional)
- Anthropic API (optional)
- Email service (Resend/Nodemailer)

## License Considerations

When using open-source resources:

1. **Check License:** MIT, Apache 2.0, GPL, etc.
2. **Attribution:** Some require attribution
3. **Commercial Use:** Verify commercial use is allowed
4. **Modifications:** Check if modifications are allowed

## Contributing Back

If you've modified open-source resources:

1. **Document Changes:** Note any modifications
2. **Maintain Attribution:** Credit original authors
3. **Share Improvements:** Consider contributing back

## Next Steps

- Review [Authentication Integration](authentication.md) for auth templates
- Check [Email Integration](email-autoresponders.md) for email templates
- See [Setup Guide](../development/setup.md) for installation instructions
