import React from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

/**
 * CanvasTrigger Component
 * Displays a button to open canvas overlay
 */
const CanvasTrigger = ({ message, onOpenCanvas }) => {
  const { canvasId, canvasData, preview, savedAt } = message.content || {};
  const sessionStarted = message.metadata?.canvasSession?.startedAt;
  
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return html`
    <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center border border-blue-500/30">
            <i className="fa-solid fa-paintbrush text-xl text-blue-400"></i>
          </div>
          <div>
            <div className="font-bold text-sm text-white mb-1">Canvas Ready</div>
            <div className="text-xs text-slate-400 space-y-1">
              ${canvasId && html`
                <div>Canvas ID: ${canvasId.split('-')[1] || canvasId.substring(0, 8)}</div>
              `}
              ${sessionStarted && html`
                <div>Session started: ${formatTime(sessionStarted)}</div>
              `}
              ${savedAt && html`
                <div className="text-green-400">
                  <i className="fa-solid fa-check-circle mr-1"></i>
                  Saved at ${formatTime(savedAt)}
                </div>
              `}
            </div>
          </div>
        </div>
        <button
          onClick=${() => onOpenCanvas && onOpenCanvas(canvasId, canvasData)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all flex items-center space-x-2 hover:scale-105 active:scale-95"
          title="Launch Canvas Tool - Fullscreen Interactive Canvas"
        >
          <i className="fa-solid fa-arrow-up-right-from-square"></i>
          <span>Open Canvas</span>
        </button>
      </div>
      ${preview && html`
        <div className="mt-4 rounded-lg overflow-hidden border border-slate-600 bg-slate-800/50 p-2">
          <div className="text-xs text-slate-400 mb-2 font-bold uppercase tracking-wider">
            Canvas Preview
          </div>
          <img src=${preview} alt="Canvas preview" className="max-w-full h-auto rounded border border-slate-700" />
        </div>
      `}
    </div>
  `;
};

export default CanvasTrigger;
