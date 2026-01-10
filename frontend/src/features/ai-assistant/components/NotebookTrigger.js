import React from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

/**
 * NotebookTrigger Component
 * Displays a button to open notebook side panel
 */
const NotebookTrigger = ({ message, onOpenNotebook }) => {
  const { noteId, noteTitle, lastSavedAt } = message.content || {};
  const sessionStarted = message.metadata?.notebookSession?.startedAt;
  const hasContent = message.content?.hasContent || false;
  
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${formatTime(timestamp)}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${formatTime(timestamp)}`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' at ' + formatTime(timestamp);
    }
  };

  return html`
    <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center border border-blue-500/30">
            <i className="fa-solid fa-book text-xl text-blue-400"></i>
          </div>
          <div>
            <div className="font-bold text-sm text-white mb-1">Notebook Ready</div>
            <div className="text-xs text-slate-400 space-y-1">
              ${noteTitle && html`
                <div className="text-white font-medium">${noteTitle}</div>
              `}
              ${hasContent && lastSavedAt ? html`
                <div className="text-green-400 flex items-center">
                  <i className="fa-solid fa-check-circle mr-1"></i>
                  Saved ${formatDate(lastSavedAt)}
                </div>
              ` : html`
                <div className="text-slate-500">New notebook</div>
              `}
              ${sessionStarted && html`
                <div>Session started: ${formatTime(sessionStarted)}</div>
              `}
            </div>
          </div>
        </div>
        <button
          onClick=${() => onOpenNotebook && onOpenNotebook(noteId)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all flex items-center space-x-2 hover:scale-105 active:scale-95"
          title="Open Notebook - Side Panel Editor"
        >
          <i className="fa-solid fa-book-open"></i>
          <span>Open Notebook</span>
        </button>
      </div>
    </div>
  `;
};

export default NotebookTrigger;
