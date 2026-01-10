import React, { useState } from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

/**
 * Tooltip Component
 * Shows helpful information on hover/focus
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Element to attach tooltip to
 * @param {string} props.text - Tooltip text content
 * @param {string} props.position - Position: 'top', 'right', 'bottom', 'left' (default: 'top')
 */
const Tooltip = ({ children, text, position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-800 border-l-transparent border-r-transparent border-b-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-slate-800 border-t-transparent border-b-transparent border-l-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-800 border-t-transparent border-l-transparent border-r-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-800 border-r-transparent border-t-transparent border-b-transparent'
  };

  return html`
    <div 
      className="relative inline-block"
      onMouseEnter=${() => setIsVisible(true)}
      onMouseLeave=${() => setIsVisible(false)}
      onFocus=${() => setIsVisible(true)}
      onBlur=${() => setIsVisible(false)}
    >
      ${children}
      ${isVisible && html`
        <div 
          className=${`absolute z-[1000] ${positionClasses[position]} whitespace-nowrap animate-fadeIn pointer-events-none`}
        >
          <div className="bg-slate-800 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-xl border border-slate-700 max-w-xs">
            ${text}
            <div className=${`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}></div>
          </div>
        </div>
      `}
    </div>
  `;
};

export default Tooltip;
