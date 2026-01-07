# Design System

## Overview

The Nova‑XFinity AI Article Writer uses a modern 3D-themed design system with elegant colors, smooth animations, and contemporary UI elements.

## Color Palette

### Primary Colors

**Deep Blue Gradient:**
- Primary 900: `#1e3a8a` - Deep navy (darkest)
- Primary 700: `#1e40af` - Rich blue
- Primary 600: `#2563eb` - Vibrant blue
- Primary 500: `#3b82f6` - Standard blue
- Primary 400: `#60a5fa` - Light blue
- Primary 300: `#93c5fd` - Lighter blue
- Primary 100: `#dbeafe` - Very light blue
- Primary 50: `#eff6ff` - Lightest blue

### Secondary Colors

**Purple Accents:**
- Purple 700: `#7c3aed` - Rich purple
- Purple 600: `#9333ea` - Vibrant purple
- Purple 500: `#a855f7` - Standard purple

### Semantic Colors

**Success (Emerald):**
- Success 600: `#10b981` - Primary success
- Success 500: `#34d399` - Light success
- Success 100: `#d1fae5` - Background success

**Warning (Amber):**
- Warning 600: `#d97706` - Primary warning
- Warning 500: `#f59e0b` - Light warning

**Error (Red):**
- Error 600: `#dc2626` - Primary error
- Error 500: `#ef4444` - Light error

### Neutral Colors

**Background:**
- Slate 950: `#020617` - Darkest background
- Slate 900: `#0f172a` - Dark background
- Slate 800: `#1e293b` - Medium dark
- Slate 700: `#334155` - Medium

**Text:**
- Slate 50: `#f8fafc` - Lightest text
- Slate 100: `#f1f5f9` - Very light text
- Slate 200: `#e2e8f0` - Light text
- Slate 400: `#94a3b8` - Medium text
- Slate 600: `#475569` - Dark text
- Slate 900: `#0f172a` - Darkest text

### Gradients

**Primary Gradient:**
```css
background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
```

**Dark Gradient:**
```css
background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
```

**Purple Gradient:**
```css
background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
```

## Typography

### Font Family

**Primary Font:** Inter
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Font Weights

- **300:** Light
- **400:** Regular
- **500:** Medium
- **600:** Semi-bold
- **700:** Bold
- **800:** Extra-bold
- **900:** Black

### Font Sizes

- **xs:** 0.75rem (12px) - Labels, captions
- **sm:** 0.875rem (14px) - Small text
- **base:** 1rem (16px) - Body text
- **lg:** 1.125rem (18px) - Large body
- **xl:** 1.25rem (20px) - Subheadings
- **2xl:** 1.5rem (24px) - Headings
- **3xl:** 1.875rem (30px) - Large headings
- **4xl:** 2.25rem (36px) - Extra large headings

### Line Heights

- **tight:** 1.25 - Headings
- **normal:** 1.5 - Body text
- **relaxed:** 1.75 - Long-form content

## 3D Design Elements

### Depth and Elevation

**Card Depth Levels:**

1. **Level 1 (Subtle):**
   ```css
   box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
   ```

2. **Level 2 (Medium):**
   ```css
   box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
   ```

3. **Level 3 (Elevated):**
   ```css
   box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
   ```

4. **Level 4 (Floating):**
   ```css
   box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15), 0 10px 10px rgba(0, 0, 0, 0.04);
   ```

### 3D Transformations

**Hover Effects:**
```css
transform: translateY(-2px) translateZ(10px);
transition: transform 0.3s ease, box-shadow 0.3s ease;
```

**Active States:**
```css
transform: translateY(0) translateZ(0) scale(0.98);
```

### Glassmorphism

**Glass Panel Effect:**
```css
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.2);
```

**Dark Glass:**
```css
background: rgba(15, 23, 42, 0.8);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.1);
```

## Component Styles

### Buttons

**Primary Button (3D):**
```css
.button-3d-primary {
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4),
              0 2px 4px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: translateZ(0);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.button-3d-primary:hover {
  transform: translateY(-2px) translateZ(10px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5),
              0 4px 6px rgba(0, 0, 0, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.button-3d-primary:active {
  transform: translateY(0) scale(0.98);
}
```

**Secondary Button:**
```css
.button-3d-secondary {
  background: rgba(124, 58, 237, 0.1);
  border: 2px solid #7c3aed;
  color: #7c3aed;
  backdrop-filter: blur(10px);
}
```

### Cards

**3D Card:**
```css
.card-3d {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2),
              0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateZ(0);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card-3d:hover {
  transform: translateY(-4px) translateZ(20px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3),
              0 8px 16px rgba(0, 0, 0, 0.15);
}
```

### Inputs

**3D Input:**
```css
.input-3d {
  background: rgba(15, 23, 42, 0.8);
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-radius: 1rem;
  color: #f1f5f9;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.input-3d:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1),
              0 0 20px rgba(59, 130, 246, 0.2);
  outline: none;
}
```

## Animations

### Transitions

**Standard Transition:**
```css
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

**Fast Transition:**
```css
transition: all 0.15s ease-out;
```

**Smooth Transition:**
```css
transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
```

### Keyframe Animations

**Fade In:**
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Pulse:**
```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
```

**Progress Loop:**
```css
@keyframes progressLoop {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(300%);
  }
}
```

### Animation Usage

**Apply animations:**
```css
.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

## Spacing System

### Spacing Scale

Based on 4px base unit:

- **1:** 0.25rem (4px)
- **2:** 0.5rem (8px)
- **3:** 0.75rem (12px)
- **4:** 1rem (16px)
- **6:** 1.5rem (24px)
- **8:** 2rem (32px)
- **10:** 2.5rem (40px)
- **12:** 3rem (48px)
- **16:** 4rem (64px)
- **20:** 5rem (80px)

## Border Radius

### Radius Scale

- **sm:** 0.375rem (6px) - Small elements
- **md:** 0.5rem (8px) - Default
- **lg:** 0.75rem (12px) - Large elements
- **xl:** 1rem (16px) - Extra large
- **2xl:** 1.5rem (24px) - Cards
- **3xl:** 2rem (32px) - Large cards
- **full:** 9999px - Pills, circles

## Shadows

### Shadow Levels

```css
/* Subtle */
shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);

/* Default */
shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);

/* Medium */
shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);

/* Large */
shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);

/* Extra Large */
shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04);

/* Colored Shadows */
shadow-blue-500/20: 0 20px 25px rgba(59, 130, 246, 0.2);
```

## Responsive Design

### Breakpoints

- **sm:** 640px - Small devices
- **md:** 768px - Tablets
- **lg:** 1024px - Desktops
- **xl:** 1280px - Large desktops
- **2xl:** 1536px - Extra large desktops

### Mobile First

Design for mobile first, then enhance for larger screens:

```css
/* Mobile */
.component {
  padding: 1rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .component {
    padding: 2rem;
  }
}
```

## Accessibility

### Color Contrast

- **Text:** Minimum 4.5:1 contrast ratio
- **Large Text:** Minimum 3:1 contrast ratio
- **Interactive Elements:** Clear focus states

### Focus States

```css
.focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
```

### Semantic HTML

- Use proper heading hierarchy
- Include ARIA labels where needed
- Ensure keyboard navigation

## Usage Guidelines

### Do's

✅ Use the defined color palette
✅ Apply 3D effects consistently
✅ Use smooth transitions
✅ Maintain proper spacing
✅ Follow typography scale
✅ Ensure accessibility

### Don'ts

❌ Don't use arbitrary colors
❌ Don't mix design patterns
❌ Don't skip hover states
❌ Don't ignore accessibility
❌ Don't use too many animations
❌ Don't break responsive design

## Design Tokens

For implementation, create design tokens:

```javascript
// design-tokens.js
export const tokens = {
  colors: {
    primary: {
      900: '#1e3a8a',
      600: '#2563eb',
      500: '#3b82f6',
    },
    // ...
  },
  spacing: {
    // ...
  },
  shadows: {
    // ...
  },
};
```

## Next Steps

- Review [Component Library](components.md) for component patterns
- Check [Animation Guidelines](animations.md) for animation details
- See [Frontend Architecture](../architecture/frontend.md) for implementation
