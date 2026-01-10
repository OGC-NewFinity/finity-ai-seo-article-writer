import React, { useState, useRef, useEffect } from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const ToolsDropdown = ({ onToolSelect, onFileSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const tools = [
    { id: 'upload', label: 'Add Photos & Files', icon: 'fa-image', action: 'upload' },
    { id: 'novax-agent', label: 'NovaX Agent', icon: 'fa-robot', action: 'tool' },
    { id: 'deep-research', label: 'Deep Research', icon: 'fa-microscope', action: 'tool' },
    { id: 'shopping-research', label: 'Shopping Research', icon: 'fa-cart-shopping', action: 'tool' },
    { id: 'notebook', label: 'Add Notebook', icon: 'fa-book', action: 'tool' },
    { id: 'study', label: 'Study and Learn', icon: 'fa-graduation-cap', action: 'tool' },
    { id: 'canvas', label: 'Canvas', icon: 'fa-paintbrush', action: 'tool' },
    { id: 'web-search', label: 'Web Search', icon: 'fa-magnifying-glass', action: 'tool' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToolClick = (tool) => {
    setIsOpen(false);
    if (tool.action === 'upload' || tool.action === 'file') {
      // Trigger upload tool context - creates a message with upload UI
      onToolSelect && onToolSelect(tool);
    } else {
      onToolSelect && onToolSelect(tool);
    }
  };

  return html`
    <div className="relative" ref=${dropdownRef}>
      <button
        onClick=${() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-all text-slate-300 hover:text-white"
        title="Add Tools"
      >
        <i className="fa-solid fa-plus text-sm"></i>
      </button>

      ${isOpen && html`
        <div className="absolute z-[100] bottom-full left-0 mb-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-dropdownIn backdrop-blur-xl">
          <div className="py-2 max-h-80 overflow-y-auto custom-scrollbar">
            ${tools.map((tool) => html`
              <button
                key=${tool.id}
                onClick=${() => handleToolClick(tool)}
                className="w-full flex items-center px-4 py-3 text-left text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
              >
                <i className=${`fa-solid ${tool.icon} w-5 text-slate-400`}></i>
                <span className="font-bold text-sm ml-3">${tool.label}</span>
              </button>
            `)}
          </div>
        </div>
      `}
    </div>
  `;
};

export default ToolsDropdown;
