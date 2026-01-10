import React from 'react';
import htm from 'htm';
import TextBubble from './TextBubble.js';
import FilePreview from './FilePreview.js';
import FileUploadRenderer from './FileUploadRenderer.js';
import ToolResultCard from './ToolResultCard.js';
import CanvasTrigger from './CanvasTrigger.js';
import NotebookTrigger from './NotebookTrigger.js';
import AlertMessage from './AlertMessage.js';
import ResearchLoadingSkeleton from './ResearchLoadingSkeleton.js';
import ShoppingLoadingSkeleton from './ShoppingLoadingSkeleton.js';
import ComparisonCardGroup from './ComparisonCardGroup.js';
import { SmartTagGroup } from '@/components/common/SmartTagPill.js';

const html = htm.bind(React.createElement);

/**
 * MessageBubble Component
 * Main component that routes to appropriate message type renderer
 */
const MessageBubble = ({ message, onOpenCanvas, onOpenNotebook, onRetry, onFilesUploaded, onFileRemove }) => {
  const renderContent = () => {
    // Upload tool - show upload renderer (interactive)
    if (message.type === 'upload' || (message.toolContext?.id === 'upload' && message.role === 'user')) {
      return html`<${FileUploadRenderer} 
        message=${message} 
        onFilesUploaded=${onFilesUploaded}
      />`;
    }
    
    // User messages with file type should show file preview
    if (message.type === 'file' && message.role === 'user') {
      return html`<${FilePreview} message=${message} onRemove=${onFileRemove} />`;
    }
    
    switch (message.type) {
      case 'file':
        return html`<${FilePreview} message=${message} onRemove=${onFileRemove} />`;
      case 'tool':
        return html`<${ToolResultCard} message=${message} />`;
      case 'shopping':
        return html`<${ComparisonCardGroup} message=${message} />`;
      case 'canvas':
        return html`<${CanvasTrigger} message=${message} onOpenCanvas=${onOpenCanvas} />`;
      case 'notebook':
        return html`<${NotebookTrigger} message=${message} onOpenNotebook=${onOpenNotebook} />`;
      case 'alert':
        return html`<${AlertMessage} message=${message} onRetry=${onRetry} />`;
      case 'text':
      default:
        return html`<${TextBubble} message=${message} role=${message.role} />`;
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return html`
    <div className=${`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
      <div className=${`max-w-[80%] ${
        message.role === 'user' 
          ? 'bg-blue-600 text-white' 
          : 'bg-slate-800 text-slate-100'
      } rounded-2xl p-4 shadow-lg`}>
        ${message.loading ? html`
          ${message.toolContext?.id === 'deep-research' || message.toolLabel === 'Deep Research' ? html`
            <${ResearchLoadingSkeleton} toolLabel=${message.toolLabel || message.toolContext?.label || 'Deep Research'} />
          ` : message.toolContext?.id === 'shopping-research' || message.toolLabel === 'Shopping Research' ? html`
            <${ShoppingLoadingSkeleton} toolLabel=${message.toolLabel || message.toolContext?.label || 'Shopping Research'} />
          ` : html`
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style=${{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style=${{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style=${{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-xs font-medium text-slate-400">Thinking...</span>
            </div>
          `}
        ` : html`
          ${renderContent()}
          
          <!-- Message Metadata -->
          ${!message.loading && html`
            <div className="mt-3 space-y-2 pt-2 border-t ${message.role === 'user' ? 'border-blue-500/30' : 'border-slate-600/50'}">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2 text-[10px] ${message.role === 'user' ? 'text-blue-200' : 'text-slate-400'} font-bold">
                  ${message.timestamp && html`
                    <span>${formatTimestamp(message.timestamp)}</span>
                  `}
                  ${message.toolContext && html`
                    <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded text-blue-400">
                      ${message.toolContext.label || message.toolContext.id}
                    </span>
                  `}
                  ${message.toolLabel && html`
                    <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded text-blue-400">
                      ${message.toolLabel}
                    </span>
                  `}
                </div>
                ${message.metadata && message.metadata.model && message.role !== 'user' && html`
                  <div className="text-[10px] text-slate-500 font-bold">
                    Generated with ${message.metadata.model.toUpperCase()}
                  </div>
                `}
              </div>
              ${message.tags && Array.isArray(message.tags) && message.tags.length > 0 && html`
                <${SmartTagGroup} 
                  tags=${message.tags} 
                  variant=${message.role === 'user' ? 'user' : 'assistant'}
                  maxTags=${8}
                  showTooltip=${true}
                />
              `}
            </div>
          `}
        `}
      </div>
    </div>
  `;
};

export default MessageBubble;
