
import React, { useState, useRef, useEffect } from 'react';
import htm from 'htm';
import { LANGUAGE_OPTIONS } from '../../constants.js';

const html = htm.bind(React.createElement);

const CustomDropdown = ({ label, options, value, onChange, type = 'text' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = type === 'language' 
    ? LANGUAGE_OPTIONS.find(l => l.label === value) 
    : options.find(o => o === value);

  return html`
    <div className="relative" ref=${dropdownRef}>
      ${label && html`<label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-widest">${label}</label>`}
      <button
        type="button"
        onClick=${() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-900 text-white border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:outline-none text-left transition-all hover:bg-slate-800 shadow-sm"
      >
        <span className="flex items-center">
          ${type === 'language' && selectedOption && html`
            <span className="mr-3 text-lg leading-none filter drop-shadow-sm">${selectedOption.flag}</span>
          `}
          <span className="truncate font-bold text-sm tracking-tight">${type === 'language' ? selectedOption?.label : selectedOption}</span>
        </span>
        <i className=${`fa-solid fa-chevron-down text-[10px] text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      ${isOpen && html`
        <div className="absolute z-[100] mt-2 w-full bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-dropdownIn backdrop-blur-xl">
          <div className="max-h-64 overflow-y-auto custom-scrollbar py-2">
            ${options.map((opt, idx) => {
              const isSelected = type === 'language' ? opt.label === value : opt === value;
              const displayLabel = type === 'language' ? opt.label : opt;
              const flag = type === 'language' ? opt.flag : null;

              return html`
                <button
                  key=${idx}
                  type="button"
                  onClick=${() => {
                    onChange(type === 'language' ? opt.label : opt);
                    setIsOpen(false);
                  }}
                  className=${`w-full flex items-center px-4 py-3.5 text-sm text-left transition-all ${
                    isSelected 
                      ? 'bg-blue-600 text-white font-black' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  ${type === 'language' && html`
                    <span className="mr-3 text-lg leading-none w-7 text-center">${flag}</span>
                  `}
                  <span className="flex-1 font-bold">${displayLabel}</span>
                  ${isSelected && html`<i className="fa-solid fa-check ml-2 text-[10px]"></i>`}
                </button>
              `;
            })}
          </div>
        </div>
      `}
    </div>
  `;
};

export default CustomDropdown;
