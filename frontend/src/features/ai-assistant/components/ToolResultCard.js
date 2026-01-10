import React from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

/**
 * ToolResultCard Component
 * Displays tool-specific results in a structured card format
 * Enhanced for Deep Research with tags, source cards, and timestamps
 */
const ToolResultCard = ({ message }) => {
  const content = message.content || {};
  const { toolName, toolLabel, result, summary, sources, tags: contentTags, timestamp: contentTimestamp, data } = content;
  const metadata = message.metadata || {};
  // Tags can be on message or in content
  const tags = Array.isArray(message.tags) ? message.tags : (Array.isArray(contentTags) ? contentTags : []);
  const timestamp = contentTimestamp || message.timestamp || metadata.timestamp || metadata.receivedAt;

  // Format timestamp for display
  const formatTimestamp = (ts) => {
    if (!ts) return '';
    try {
      const date = new Date(ts);
      const now = new Date();
      const diffMs = now - date;
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      
      // If less than a minute ago, show "Just now"
      if (diffSec < 60) {
        return 'Just now';
      }
      
      // If less than an hour ago, show minutes
      if (diffMin < 60) {
        return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
      }
      
      // Otherwise show formatted date and time
      const options = { 
        month: 'short', 
        day: 'numeric', 
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        hour: '2-digit', 
        minute: '2-digit' 
      };
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      return '';
    }
  };

  // Format timestamp for metadata display (e.g., "Received Jan 10, 2026 at 19:23")
  const formatReceivedTimestamp = (ts) => {
    if (!ts) {
      // Fallback to message timestamp
      if (message.timestamp) {
        ts = message.timestamp;
      } else {
        return '';
      }
    }
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

  return html`
    <div className="space-y-4">
      <!-- Tool Header with Label -->
      ${toolLabel && html`
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <i className="fa-solid fa-microscope text-blue-400"></i>
            <span className="font-bold text-sm text-blue-400 uppercase tracking-wider">
              ${toolLabel}
            </span>
          </div>
          ${(timestamp || message.timestamp || metadata.receivedAt) && html`
            <div className="text-[10px] text-slate-400 font-medium">
              ${formatReceivedTimestamp(timestamp || metadata.receivedAt)}
            </div>
          `}
        </div>
      `}
      
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
      
      <!-- Summary/Result -->
      ${summary && html`
        <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
          <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap font-medium text-slate-100 leading-relaxed">
            ${summary}
          </div>
        </div>
      `}
      
      ${!summary && result && typeof result === 'string' && html`
        <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
          <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap font-medium text-slate-100 leading-relaxed">
            ${result}
          </div>
        </div>
      `}
      
      ${!summary && result && typeof result === 'object' && html`
        <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
          <pre className="text-xs text-slate-300 overflow-x-auto font-mono">
            ${JSON.stringify(result, null, 2)}
          </pre>
        </div>
      `}
      
      <!-- Sources with Enhanced Cards -->
      ${sources && Array.isArray(sources) && sources.length > 0 && html`
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center space-x-2 mb-3">
            <i className="fa-solid fa-book-open text-blue-400"></i>
            <span className="font-bold text-xs text-slate-400 uppercase tracking-wider">
              Sources (${sources.length})
            </span>
          </div>
          <div className="space-y-3">
            ${sources.map((source, idx) => html`
              <div 
                key=${idx} 
                className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50 hover:border-slate-600 transition-colors"
              >
                ${source.title && html`
                  <div className="mb-2">
                    ${source.url ? html`
                      <a 
                        href=${source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 font-semibold text-sm flex items-center space-x-2 group"
                      >
                        <span className="group-hover:underline">${source.title}</span>
                        <i className="fa-solid fa-external-link text-xs opacity-0 group-hover:opacity-100 transition-opacity"></i>
                      </a>
                    ` : html`
                      <div className="text-slate-200 font-semibold text-sm">
                        ${source.title}
                      </div>
                    `}
                  </div>
                `}
                ${source.snippet && html`
                  <p className="text-xs text-slate-400 font-medium leading-relaxed mb-2 line-clamp-3">
                    ${source.snippet}
                  </p>
                `}
                ${source.url && (!source.title || source.url !== source.title) && html`
                  <a 
                    href=${source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:text-blue-400 font-medium truncate block mt-2"
                    title=${source.url}
                  >
                    <i className="fa-solid fa-link mr-1"></i>
                    ${source.url.length > 60 ? source.url.substring(0, 60) + '...' : source.url}
                  </a>
                `}
              </div>
            `)}
          </div>
        </div>
      `}
      
      <!-- Additional Data (for debugging/development) -->
      ${data && typeof data === 'object' && Object.keys(data).length > 0 && !data.summary && !data.sources && html`
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">
            Additional Data
          </div>
          <pre className="text-xs text-slate-300 overflow-x-auto font-mono max-h-48 overflow-y-auto">
            ${JSON.stringify(data, null, 2)}
          </pre>
        </div>
      `}
    </div>
  `;
};

export default ToolResultCard;
