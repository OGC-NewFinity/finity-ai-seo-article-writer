import React, { useState } from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

/**
 * SmartTagPill Component
 * Displays a smart tag as a rounded badge with hover tooltip
 * Dark mode friendly with proper styling
 */
const SmartTagPill = ({ tag, className = '', showTooltip = true, variant = 'default' }) => {
  const [showHoverTooltip, setShowHoverTooltip] = useState(false);
  
  if (!tag || typeof tag !== 'string' || tag.trim().length === 0) {
    return null;
  }
  
  // Variant-based styling
  const variantStyles = {
    default: 'bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-slate-700 hover:border-slate-500',
    user: 'bg-blue-500/20 border-blue-500/30 text-blue-300 hover:bg-blue-500/30 hover:border-blue-400',
    assistant: 'bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-slate-700 hover:border-slate-500',
    tool: 'bg-blue-500/20 border-blue-500/30 text-blue-400 hover:bg-blue-500/30 hover:border-blue-400',
    file: 'bg-purple-500/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/30 hover:border-purple-400',
    highlight: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/30 hover:border-yellow-400'
  };
  
  const baseStyles = variantStyles[variant] || variantStyles.default;
  
  return html`
    <span className="relative inline-block">
      <span
        className=${`inline-flex items-center px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all cursor-default ${baseStyles} ${className}`}
        onMouseEnter=${showTooltip ? () => setShowHoverTooltip(true) : undefined}
        onMouseLeave=${showTooltip ? () => setShowHoverTooltip(false) : undefined}
        title=${showTooltip ? undefined : tag}
      >
        ${tag}
      </span>
      ${showHoverTooltip && showTooltip && html`
        <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-slate-900 text-slate-200 text-[9px] font-medium rounded whitespace-nowrap pointer-events-none z-50 border border-slate-700 shadow-lg">
          Detected Topic
          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-700"></span>
        </span>
      `}
    </span>
  `;
};

/**
 * SmartTagGroup Component
 * Displays multiple tags in a flex wrap container
 */
export const SmartTagGroup = ({ tags, className = '', variant = 'default', maxTags = null, showTooltip = true }) => {
  if (!tags || !Array.isArray(tags) || tags.length === 0) {
    return null;
  }
  
  const displayTags = maxTags ? tags.slice(0, maxTags) : tags;
  const remainingCount = maxTags && tags.length > maxTags ? tags.length - maxTags : 0;
  
  return html`
    <div className=${`flex flex-wrap gap-1.5 items-center ${className}`}>
      ${displayTags.map((tag, idx) => html`
        <${SmartTagPill} 
          key=${idx} 
          tag=${tag} 
          variant=${variant}
          showTooltip=${showTooltip}
        />
      `)}
      ${remainingCount > 0 && html`
        <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-400">
          +${remainingCount}
        </span>
      `}
    </div>
  `;
};

export default SmartTagPill;
