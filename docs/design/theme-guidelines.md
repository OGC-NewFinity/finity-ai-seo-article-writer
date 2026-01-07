# Theme Guidelines

This document defines the official Nova‑XFinity theming system for UI design and frontend implementation. It ensures consistent application of colors, spacing, typography, shadows, and elevation across all components and views in the platform.

---

## 🎨 Color System

Nova‑XFinity operates on a dark theme by default, optimized for plasma and neon aesthetics.

### Brand Colors

| Token                | Description           | Hex Code   |
|----------------------|-----------------------|------------|
| `--color-primary`    | Neon Teal             | `#00FFC6`  |
| `--color-accent`     | Sunburst Yellow       | `#FFBC25`  |
| `--color-highlight`  | Electric Pink         | `#FF3CAC`  |
| `--color-base`       | Deep Violet Blue      | `#5864FF`  |
| `--text-color`       | White (default)       | `#FFFFFF`  |
| `--bg-transparent`   | Transparent Dark Base | `rgba(0,0,0,0)` |

Defined in `/styles/tokens.css` and applied globally via layout wrappers.

---

## 🖋️ Typography

Nova‑XFinity uses the `Inter` font family across all UIs.

### Font Tokens

| Size  | Use Case           | Rem     | px  |
|-------|---------------------|--------|-----|
| xs    | Captions, labels    | 0.75   | 12  |
| sm    | Small body text     | 0.875  | 14  |
| base  | Standard text       | 1      | 16  |
| lg    | Large text blocks   | 1.125  | 18  |
| xl    | Subheadings         | 1.25   | 20  |
| 2xl   | Section headers     | 1.5    | 24  |
| 3xl   | Large headers       | 1.875  | 30  |
| 4xl   | Hero headings       | 2.25   | 36  |

Font weights: `300`–`900`  
Line heights: `tight`, `normal`, `relaxed`

---

## 🧱 Spacing & Layout

All spacing is based on a 4px scale for consistency.

### Spacing Tokens

| Token | px   | Use Case           |
|-------|------|--------------------|
| 1     | 4px  | Tight margins      |
| 2     | 8px  | Small gaps         |
| 4     | 16px | Standard spacing   |
| 6     | 24px | Section padding    |
| 8     | 32px | Large padding      |
| 10+   | 40px+| Layout containers  |

Use `rem` units in CSS (`1rem = 16px`)

---

## 🧊 Elevation & Shadows

Nova‑XFinity uses layered depth to create a 3D feel via custom shadows.

### Elevation Levels

| Level | Description       | Shadow Example                                |
|-------|-------------------|-----------------------------------------------|
| 1     | Subtle elements   | `box-shadow: 0 1px 3px rgba(0,0,0,0.1);`      |
| 2     | Interactive items | `box-shadow: 0 4px 6px rgba(0,0,0,0.1);`      |
| 3     | Modals, cards     | `box-shadow: 0 10px 15px rgba(0,0,0,0.1);`    |
| 4     | Floating panels   | `box-shadow: 0 20px 25px rgba(0,0,0,0.15);`   |

Hover transitions should apply elevation increases (`+1 level`)

---

## 🧬 Border Radius

| Token  | Radius | Use Case           |
|--------|--------|--------------------|
| sm     | 6px    | Inputs, buttons    |
| md     | 8px    | Cards, modals      |
| xl     | 16px   | Layout containers  |
| 2xl    | 24px   | Hero sections      |
| full   | 9999px | Circular avatars   |

---

## 💡 Theme Rules

- Dark theme only (no light mode)
- All backgrounds must be transparent or dark
- All text uses `#FFFFFF` unless overridden with tokens
- Never use arbitrary color values in components
- Gradients must use official brand colors

---

## 🧠 Accessibility

- Minimum text contrast: 4.5:1
- Interactive elements must show `:focus-visible` outlines
- Responsive font sizes using `rem`
- Avoid motion overload (see `prefers-reduced-motion`)

---

## 📁 Related Files

- `/styles/tokens.css` — global CSS variables
- `/styles/theme.css` — base theme classes
- `/docs/design/design-system.md` — extended design system
- `/docs/design/animations.md` — transitions & keyframes

---

## 📌 Next Steps

- Ensure all components import token variables from `tokens.css`
- Add a global theme switch (even if dark-only)
- Expand support for hover-based depth changes
