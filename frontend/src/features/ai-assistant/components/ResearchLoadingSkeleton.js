import React from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

/**
 * ResearchLoadingSkeleton Component
 * Animated skeleton loader for deep research requests
 */
const ResearchLoadingSkeleton = ({ toolLabel = 'Deep Research' }) => {
  return html`
    <div className="space-y-4 animate-pulse">
      <!-- Tool Header -->
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-400/30 rounded"></div>
          <div className="h-4 w-24 bg-slate-600/50 rounded"></div>
        </div>
        <div className="h-3 w-32 bg-slate-600/50 rounded"></div>
      </div>

      <!-- Tags Skeleton -->
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="h-6 w-16 bg-blue-500/20 rounded-lg"></div>
        <div className="h-6 w-20 bg-blue-500/20 rounded-lg"></div>
        <div className="h-6 w-14 bg-blue-500/20 rounded-lg"></div>
      </div>

      <!-- Summary Skeleton -->
      <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600 space-y-2">
        <div className="h-4 bg-slate-600/50 rounded w-full"></div>
        <div className="h-4 bg-slate-600/50 rounded w-5/6"></div>
        <div className="h-4 bg-slate-600/50 rounded w-4/6"></div>
        <div className="h-4 bg-slate-600/50 rounded w-full"></div>
        <div className="h-4 bg-slate-600/50 rounded w-3/4"></div>
      </div>

      <!-- Sources Skeleton -->
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-4 h-4 bg-blue-400/30 rounded"></div>
          <div className="h-3 w-20 bg-slate-600/50 rounded"></div>
        </div>
        <div className="space-y-3">
          ${[1, 2, 3].map((i) => html`
            <div key=${i} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50 space-y-2">
              <div className="h-4 bg-slate-600/50 rounded w-3/4"></div>
              <div className="h-3 bg-slate-600/50 rounded w-full"></div>
              <div className="h-3 bg-slate-600/50 rounded w-2/3"></div>
              <div className="h-3 bg-slate-600/50 rounded w-1/2"></div>
            </div>
          `)}
        </div>
      </div>

      <!-- Loading Status -->
      <div className="flex items-center justify-center space-x-2 pt-2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style=${{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style=${{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style=${{ animationDelay: '300ms' }}></div>
        </div>
        <span className="text-xs font-medium text-slate-400">Researching...</span>
      </div>
    </div>
  `;
};

export default ResearchLoadingSkeleton;
