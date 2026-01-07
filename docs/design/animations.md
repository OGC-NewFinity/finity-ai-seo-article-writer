# Animation Guidelines

## Overview

Animations in the Nova‑XFinity AI Article Writer follow a consistent pattern focused on smooth transitions, 3D effects, and subtle feedback mechanisms.

## Animation Principles

1. **Purposeful:** Every animation should have a clear purpose
2. **Smooth:** Use easing functions for natural motion
3. **Fast:** Keep animations quick (200-500ms)
4. **Subtle:** Don't distract from content
5. **Consistent:** Use same patterns throughout

## Timing Functions

### Standard Easing

```css
/* Ease (default) */
transition: all 0.3s ease;

/* Ease-out (most common) */
transition: all 0.3s ease-out;

/* Ease-in-out (symmetric) */
transition: all 0.3s ease-in-out;

/* Custom cubic-bezier */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### Recommended Durations

- **Fast:** 150ms - Micro-interactions
- **Normal:** 300ms - Standard transitions
- **Slow:** 500ms - Complex animations
- **Very Slow:** 800ms - Page transitions

## Transition Patterns

### Hover Transitions

**Button Hover:**
```css
.button {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.button:hover {
  transform: translateY(-2px) translateZ(10px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5);
}
```

**Card Hover:**
```css
.card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-4px) translateZ(20px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}
```

### Active States

**Button Press:**
```css
.button:active {
  transform: translateY(0) scale(0.98);
  transition: transform 0.1s ease;
}
```

## Keyframe Animations

### Fade In

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

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}
```

### Slide In

```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### Scale In

```css
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

### Pulse

```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### Spin

```css
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
```

### Progress Loop

```css
@keyframes progressLoop {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(300%);
  }
}

.animate-progressLoop {
  animation: progressLoop 2s ease-in-out infinite;
}
```

## Loading Animations

### Spinner

```javascript
const Spinner = () => html`
  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
`;
```

### Skeleton Loading

```css
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
```

### Progress Bar

```javascript
const ProgressBar = ({ progress }) => html`
  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
    <div 
      className="h-full bg-blue-500 transition-all duration-300"
      style=${{ width: `${progress}%` }}
    ></div>
  </div>
`;
```

## 3D Transformations

### Card Flip

```css
.card-flip {
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

.card-flip:hover {
  transform: rotateY(180deg);
}
```

### Perspective Hover

```css
.perspective-container {
  perspective: 1000px;
}

.perspective-item {
  transition: transform 0.3s;
}

.perspective-item:hover {
  transform: rotateX(5deg) rotateY(5deg) translateZ(20px);
}
```

## Background Animations

### Gradient Mesh

```css
@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.gradient-mesh {
  background: linear-gradient(-45deg, #1e3a8a, #3b82f6, #7c3aed, #a855f7);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}
```

### Floating Particles

```javascript
// Using CSS animations for particles
.particle {
  position: absolute;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.3);
  animation: float 20s infinite ease-in-out;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(100px, -100px) scale(1.5);
    opacity: 0.6;
  }
}
```

## Page Transitions

### Fade Transition

```javascript
const FadeTransition = ({ children, show }) => {
  return html`
    <div className=${`transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}>
      ${children}
    </div>
  `;
};
```

### Slide Transition

```javascript
const SlideTransition = ({ children, direction = 'right' }) => {
  const directions = {
    right: 'translateX(100%)',
    left: 'translateX(-100%)',
    up: 'translateY(-100%)',
    down: 'translateY(100%)'
  };
  
  return html`
    <div 
      className="transition-transform duration-300"
      style=${{
        transform: show ? 'translate(0)' : directions[direction]
      }}
    >
      ${children}
    </div>
  `;
};
```

## Interaction Feedback

### Ripple Effect

```javascript
const RippleButton = ({ onClick, children }) => {
  const [ripples, setRipples] = useState([]);
  
  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { x, y, id: Date.now() };
    setRipples([...ripples, newRipple]);
    
    setTimeout(() => {
      setRipples(ripples.filter(r => r.id !== newRipple.id));
    }, 600);
    
    onClick?.(e);
  };
  
  return html`
    <button 
      className="relative overflow-hidden"
      onClick=${handleClick}
    >
      ${children}
      ${ripples.map(ripple => html`
        <span
          key=${ripple.id}
          className="absolute rounded-full bg-white opacity-50 animate-ripple"
          style=${{
            left: `${ripple.x}px`,
            top: `${ripple.y}px`,
            width: '0',
            height: '0'
          }}
        ></span>
      `)}
    </button>
  `;
};
```

### Success Animation

```css
@keyframes success {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.success-icon {
  animation: success 0.5s ease-out;
}
```

## Performance Optimization

### GPU Acceleration

Use `transform` and `opacity` for animations (GPU-accelerated):

```css
/* Good - GPU accelerated */
.element {
  transform: translateX(100px);
  opacity: 0.5;
}

/* Bad - CPU intensive */
.element {
  left: 100px;
  filter: blur(5px);
}
```

### Will-Change

Hint browser about upcoming animations:

```css
.animated-element {
  will-change: transform, opacity;
}
```

### Reduce Motion

Respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Animation Utilities

### Custom Hooks

```javascript
// hooks/useAnimation.js
export const useAnimation = (trigger) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (trigger) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [trigger]);
  
  return isAnimating;
};
```

## Animation Best Practices

1. **Use CSS animations** for simple animations
2. **Use JavaScript** for complex, interactive animations
3. **Test performance** on lower-end devices
4. **Respect reduced motion** preference
5. **Keep animations subtle** - enhance, don't distract
6. **Consistent timing** - use standard durations
7. **Smooth easing** - avoid linear animations

## Next Steps

- Review [Design System](design-system.md) for styling context
- Check [Component Library](components.md) for component animations
- See [Frontend Architecture](../architecture/frontend.md) for implementation
