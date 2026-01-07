# UI Components

This document outlines the core UI components used throughout the Nova‑XFinity platform. It defines design principles, component architecture, and usage conventions to ensure consistency, reusability, and maintainability across all frontend modules.

## 🔹 Overview

Nova‑XFinity’s UI system is built using React (Vite) with a focus on modular, declarative design patterns. All components are written in JavaScript (not TypeScript), styled using standard CSS modules (not Tailwind), and follow a dark-themed plasma/neon aesthetic defined by the official OGC color palette.

> 🧠 Key Goals:
> - Ensure pixel-perfect consistency across frontend apps.
> - Promote DRY (Don’t Repeat Yourself) principles.
> - Simplify future maintenance and upgrades.
> - Guarantee responsive behavior across desktop and mobile.

---

## 🎨 Design Tokens

All UI components rely on the following design token system to maintain brand coherence:

| Token           | Description                | Value       |
|----------------|----------------------------|-------------|
| `--color-primary`   | Neon Teal               | `#00FFC6`   |
| `--color-accent`    | Sunburst Yellow         | `#FFBC25`   |
| `--color-highlight` | Electric Pink           | `#FF3CAC`   |
| `--color-base`      | Deep Violet Blue        | `#5864FF`   |
| `--text-color`      | White (default)         | `#FFFFFF`   |
| `--bg-transparent`  | Transparent (Dark Mode) | `rgba(0,0,0,0)` |

These are defined in `/styles/tokens.css` and imported globally via the main layout shell.

---

## 🧱 Component Structure

Each component follows the same directory format:

/components/
├── Button/
│ ├── Button.js
│ ├── Button.css
│ └── index.js
├── Modal/
│ ├── Modal.js
│ ├── Modal.css
│ └── index.js
...

markdown
Copy code

### Standard Rules:
- Each folder = 1 atomic component
- Only import what is necessary — no wildcard imports
- Use `index.js` for centralized exports

---

## 📦 Core Components

### 1. **Button**

- Variant-based (`primary`, `secondary`, `ghost`)
- Supports loading spinner state
- Integrated icon support (SVGs or icon font)

### 2. **Modal**

- Centered, animated pop-ups
- Click-away to close
- Esc key support

### 3. **Input**

- Supports text, email, password
- Floating label pattern
- Optional validation and error display

### 4. **Tooltip**

- Delayed hover tooltips
- Directional support (top, right, bottom, left)

### 5. **Card**

- Flexible container with shadow & rounded corners
- Used in dashboards, asset previews, and listings

### 6. **Sidebar & Drawer**

- Collapsible with transition animations
- Scroll locking and mobile-first behavior

---

## 🧩 Advanced Components

These are composite components built from core elements.

### - **UserProfileCard**
Used in chat, wallet, and admin interfaces.

### - **AIServiceTile**
Visually represents each AI tool (e.g., ImageGen, PromptLab, StreamEnhance). Includes:
- Icon
- Title
- Description
- Action CTA

### - **StepWizard**
Used in flows like onboarding, form builders, and project generators.

---

## ✅ Best Practices

- **Reusability First:** Design with reusability in mind. Avoid project-specific logic in shared components.
- **Accessibility:** All interactive elements must follow WAI-ARIA guidelines. Include proper `aria-` tags and keyboard navigation.
- **Responsiveness:** Use CSS Grid/Flexbox with media queries. All components must gracefully degrade on mobile/tablet.
- **Minimal Dependencies:** Prefer native HTML/JS behavior. Do not introduce 3rd-party UI libs (e.g., no MUI, no Bootstrap).

---

## 🚧 Work in Progress

The following components are currently in development:
- Toast Notifications
- Theme Toggle Switch
- Rich Text Editor
- File Upload & DragDrop

---

## 📁 Reference

- `/styles/tokens.css` — design tokens
- `/components/` — all component folders
- `/layouts/` — high-level layout wrappers
- `/pages/` — routes that render component trees

---

## 📌 Next Steps

- Finalize component snapshot testing setup
- Document custom hooks (`useModal`, `useTooltip`, `useForm`)
- Add live component playground (Storybook or in-app preview)
