# Responsive Layout Guidelines

This document defines the responsive layout rules for the Nova‑XFinity platform. All interfaces must be mobile‑first, fluid, and adaptable across all screen sizes without breaking usability, hierarchy, or visual consistency.

## Core Principles

- Mobile‑first by default  
- Progressive enhancement for larger screens  
- Fluid grids and flexible containers  
- No fixed layout widths  
- Predictable behavior across breakpoints  
- Zero horizontal overflow  

## Breakpoints

| Token | Min Width | Target Devices        |
|------:|-----------|-----------------------|
| sm    | 640px     | Mobile (landscape)    |
| md    | 768px     | Tablets               |
| lg    | 1024px    | Laptops               |
| xl    | 1280px    | Desktops              |
| 2xl   | 1536px    | Ultra‑wide displays   |

## Layout Strategy

- Use **CSS Grid** for page‑level layouts  
- Use **Flexbox** for component‑level alignment  
- Avoid absolute positioning for structure  
- Containers must scale with viewport width  

## Base Layout Grid

```css
.layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .layout {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 1280px) {
  .layout {
    grid-template-columns: 1fr 2fr;
  }
}
```

## Viewport Behavior Matrix

| Element | Small Screens | Medium Screens | Large Screens |
|---------|---------------|----------------|---------------|
| Sidebar | Drawer        | Collapsible    | Fixed         |
| Header  | Compact       | Expanded       | Sticky        |
| Cards   | Stacked       | Two columns    | Grid layout   |
| Forms   | Single column | Grouped fields | Horizontal    |
| Tables  | Scrollable    | Paginated      | Enhanced UI   |

## Mobile Interaction Rules

- Minimum height for touch targets: 44px
- Bottom‑aligned actions on small viewports
- No hover‑only interactions
- All controls must be tap‑accessible

## Media Responsiveness

```css
img,
video {
  width: 100%;
  height: auto;
  max-width: 100%;
}
```

- Use `aspect-ratio` for videos and canvases
- Media must never overflow containers

## Typography Responsiveness

- Use `rem` units for all text sizes
- Use `clamp()` for dynamic heading scaling
- Avoid `vw` and `vh` units in scrollable areas

## Testing Checklist

✅ Resizes cleanly from 320px to 1920px  
✅ Sidebar and header adapt correctly  
✅ Layout stacks/collapses without bugs  
✅ No horizontal scrolling on any viewports  
✅ Forms and media are fully accessible  

## Related Files

- `/styles/layout.css`
- `/components/Sidebar`, `/Header`, `/Card`
- `/docs/design/theme-guidelines.md`
- `/docs/design/ui-components.md`
