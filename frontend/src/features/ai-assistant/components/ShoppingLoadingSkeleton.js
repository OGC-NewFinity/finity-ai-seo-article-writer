import React from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

/**
 * ShoppingLoadingSkeleton Component
 * Animated skeleton loader for shopping research requests
 */
const ShoppingLoadingSkeleton = ({ toolLabel = 'Shopping Research' }) => {
  return html`
    <div className="space-y-4 animate-pulse">
      <!-- Tool Header -->
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-400/30 rounded"></div>
          <div className="h-4 w-32 bg-slate-600/50 rounded"></div>
        </div>
        <div className="h-3 w-32 bg-slate-600/50 rounded"></div>
      </div>

      <!-- Tags Skeleton -->
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="h-6 w-16 bg-blue-500/20 rounded-lg"></div>
        <div className="h-6 w-20 bg-blue-500/20 rounded-lg"></div>
      </div>

      <!-- Results Count Skeleton -->
      <div className="h-3 w-24 bg-slate-600/50 rounded mb-3"></div>

      <!-- Product Cards Skeleton Grid -->
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${[1, 2, 3].map((i) => html`
          <div key=${i} className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
            <!-- Image Skeleton -->
            <div className="w-full aspect-square bg-slate-900">
              <div className="w-full h-full bg-slate-700/50"></div>
            </div>
            
            <!-- Content Skeleton -->
            <div className="p-4 space-y-3">
              <!-- Title Skeleton -->
              <div className="space-y-2">
                <div className="h-4 bg-slate-600/50 rounded w-3/4"></div>
                <div className="h-4 bg-slate-600/50 rounded w-1/2"></div>
              </div>
              
              <!-- Store Skeleton -->
              <div className="h-3 bg-slate-600/50 rounded w-20"></div>
              
              <!-- Price and Rating Skeleton -->
              <div className="flex items-center justify-between">
                <div className="h-5 bg-blue-400/30 rounded w-20"></div>
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-yellow-400/30 rounded"></div>
                  <div className="w-3 h-3 bg-yellow-400/30 rounded"></div>
                  <div className="w-3 h-3 bg-yellow-400/30 rounded"></div>
                  <div className="w-3 h-3 bg-yellow-400/30 rounded"></div>
                  <div className="w-3 h-3 bg-yellow-400/30 rounded"></div>
                  <div className="h-3 w-8 bg-slate-600/50 rounded ml-1"></div>
                </div>
              </div>
              
              <!-- Specs Skeleton -->
              <div className="flex flex-wrap gap-1.5">
                <div className="h-5 bg-slate-700/50 rounded w-16"></div>
                <div className="h-5 bg-slate-700/50 rounded w-20"></div>
                <div className="h-5 bg-slate-700/50 rounded w-18"></div>
              </div>
              
              <!-- Availability Skeleton -->
              <div className="pt-2 border-t border-slate-700">
                <div className="h-5 bg-slate-700/50 rounded w-24"></div>
              </div>
              
              <!-- Button Skeleton -->
              <div className="h-8 bg-blue-600/30 rounded"></div>
            </div>
          </div>
        `)}
      </div>

      <!-- Loading Status -->
      <div className="flex items-center justify-center space-x-2 pt-2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style=${{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style=${{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style=${{ animationDelay: '300ms' }}></div>
        </div>
        <span className="text-xs font-medium text-slate-400">Searching for product deals…</span>
      </div>
    </div>
  `;
};

export default ShoppingLoadingSkeleton;
