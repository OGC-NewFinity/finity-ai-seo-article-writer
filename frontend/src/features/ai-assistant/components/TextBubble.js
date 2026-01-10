import React from 'react';
import htm from 'htm';
import { SmartTagGroup } from '@/components/common/SmartTagPill.js';

const html = htm.bind(React.createElement);

/**
 * TextBubble Component
 * Renders a standard text message bubble
 * Tags are displayed by MessageBubble, but this component can also display them if needed
 */
const TextBubble = ({ message, role, showTags = false }) => {
  // Handle both string content and object content
  const content = typeof message.content === 'string' 
    ? message.content 
    : (message.content?.text || message.content?.content || JSON.stringify(message.content));
  
  return html`
    <div>
      <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap font-medium">
        ${message.error 
          ? html`<span className="text-red-400">${content}</span>` 
          : content}
      </div>
      ${showTags && message.tags && Array.isArray(message.tags) && message.tags.length > 0 && html`
        <div className="mt-2">
          <${SmartTagGroup} 
            tags=${message.tags} 
            variant=${role === 'user' ? 'user' : 'assistant'}
            maxTags=${8}
            showTooltip=${true}
          />
        </div>
      `}
    </div>
  `;
};

export default TextBubble;
