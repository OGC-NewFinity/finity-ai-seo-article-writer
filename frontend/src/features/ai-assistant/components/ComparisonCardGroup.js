import React from 'react';
import htm from 'htm';
import ComparisonCard from './ComparisonCard.js';

const html = htm.bind(React.createElement);

/**
 * ComparisonCardGroup Component
 * Wrapper component for displaying multiple product comparison cards
 */
const ComparisonCardGroup = ({ message }) => {
  const content = message.content || {};
  const { results = [], toolLabel, tags, timestamp } = content;
  const metadata = message.metadata || {};

  // Format timestamp for display
  const formatTimestamp = (ts) => {
    if (!ts) return '';
    try {
      const date = new Date(ts);
      const options = { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      };
      const formatted = date.toLocaleDateString('en-US', options);
      return `Received ${formatted}`;
    } catch (error) {
      return '';
    }
  };

  const displayTimestamp = timestamp || message.timestamp || metadata.timestamp || metadata.receivedAt;

  if (!results || results.length === 0) {
    return html`
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
        <div className="text-center text-slate-400 font-medium text-sm">
          No products found for this search.
        </div>
      </div>
    `;
  }

  return html`
    <div className="space-y-4">
      <!-- Tool Header with Label and Timestamp -->
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <i className="fa-solid fa-cart-shopping text-blue-400"></i>
          <span className="font-bold text-sm text-blue-400 uppercase tracking-wider">
            ${toolLabel || 'Shopping Research'}
          </span>
        </div>
        ${displayTimestamp && html`
          <div className="text-[10px] text-slate-400 font-medium">
            ${formatTimestamp(displayTimestamp)}
          </div>
        `}
      </div>

      <!-- Tags as Pills/Badges -->
      ${tags && Array.isArray(tags) && tags.length > 0 && html`
        <div className="flex flex-wrap gap-2 mb-3">
          ${tags.map((tag, idx) => html`
            <span 
              key=${idx}
              className="px-2.5 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-[10px] text-blue-400 font-bold uppercase tracking-wider"
            >
              ${tag}
            </span>
          `)}
        </div>
      `}

      <!-- Results Count -->
      <div className="text-xs text-slate-400 font-medium mb-3">
        Found ${results.length} ${results.length === 1 ? 'product' : 'products'}
      </div>

      <!-- Product Cards Grid -->
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${results.map((product, idx) => html`
          <${ComparisonCard} key=${idx} product=${product} />
        `)}
      </div>
    </div>
  `;
};

export default ComparisonCardGroup;
