import React, { useState, useRef, useEffect } from 'react';
import htm from 'htm';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.js';
import Tooltip from '@/components/common/Tooltip.js';

const html = htm.bind(React.createElement);

const ChatTopBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const modelDropdownRef = useRef(null);
  const accountDropdownRef = useRef(null);

  // Available models (future-ready)
  const models = [
    { id: 'naxf-0.1', label: 'NAXF 0.1', description: 'Current version' },
    { id: 'naxf-0.2', label: 'NAXF 0.2', description: 'Coming soon', disabled: true },
    { id: 'naxf-pro', label: 'NAXF Pro', description: 'Coming soon', disabled: true }
  ];

  const [selectedModel, setSelectedModel] = useState(models[0]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target)) {
        setModelDropdownOpen(false);
      }
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
        setAccountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAccountAction = (action) => {
    setAccountDropdownOpen(false);
    switch (action) {
      case 'profile':
        navigate('/account/profile');
        break;
      case 'account':
        navigate('/account/profile');
        break;
      case 'settings':
        navigate('/dashboard/settings');
        break;
      case 'logout':
        logout();
        break;
      default:
        break;
    }
  };

  const getUserInitials = () => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return html`
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
      <!-- Left: Model Switcher -->
      <div className="relative" ref=${modelDropdownRef}>
        <${Tooltip} text="Nova-XFinity AI Core Engine" position="bottom">
          <div>
            <button
              onClick=${() => setModelDropdownOpen(!modelDropdownOpen)}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl hover:bg-slate-800 transition-all text-left"
            >
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Model:</span>
              <span className="text-sm font-bold text-white">${selectedModel.label}</span>
              <i className=${`fa-solid fa-chevron-down text-[10px] text-slate-500 transition-transform duration-300 ${modelDropdownOpen ? 'rotate-180' : ''}`}></i>
            </button>
          </div>
        </${Tooltip}>

        ${modelDropdownOpen && html`
          <div className="absolute z-[100] mt-2 w-48 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-dropdownIn backdrop-blur-xl">
            <div className="py-2">
              ${models.map((model) => html`
                <button
                  key=${model.id}
                  onClick=${() => {
                    if (!model.disabled) {
                      setSelectedModel(model);
                      setModelDropdownOpen(false);
                    }
                  }}
                  disabled=${model.disabled}
                  className=${`w-full flex flex-col px-4 py-3 text-left transition-all ${
                    selectedModel.id === model.id
                      ? 'bg-blue-600 text-white'
                      : model.disabled
                      ? 'text-slate-600 cursor-not-allowed'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">${model.label}</span>
                    ${selectedModel.id === model.id && html`<i className="fa-solid fa-check text-[10px]"></i>`}
                    ${model.disabled && html`<span className="text-[9px] font-black uppercase text-slate-500">Soon</span>`}
                  </div>
                  ${model.description && html`
                    <span className="text-[10px] font-medium mt-1 opacity-75">${model.description}</span>
                  `}
                </button>
              `)}
            </div>
          </div>
        `}
      </div>

      <!-- Right: Account Menu -->
      <div className="relative" ref=${accountDropdownRef}>
        <button
          onClick=${() => setAccountDropdownOpen(!accountDropdownOpen)}
          className="flex items-center space-x-3 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl hover:bg-slate-800 transition-all"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm">
            ${getUserInitials()}
          </div>
          <div className="flex flex-col items-start">
            <span className="text-xs font-bold text-white">${user?.email?.split('@')[0] || 'User'}</span>
            <span className="text-[10px] font-medium text-slate-400">${user?.email || ''}</span>
          </div>
          <i className=${`fa-solid fa-chevron-down text-[10px] text-slate-500 transition-transform duration-300 ${accountDropdownOpen ? 'rotate-180' : ''}`}></i>
        </button>

        ${accountDropdownOpen && html`
          <div className="absolute z-[100] right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-dropdownIn backdrop-blur-xl">
            <div className="py-2">
              <button
                onClick=${() => handleAccountAction('profile')}
                className="w-full flex items-center px-4 py-3 text-left text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
              >
                <i className="fa-solid fa-user w-5 text-slate-400"></i>
                <span className="font-bold text-sm ml-3">Profile</span>
              </button>
              <button
                onClick=${() => handleAccountAction('account')}
                className="w-full flex items-center px-4 py-3 text-left text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
              >
                <i className="fa-solid fa-user-circle w-5 text-slate-400"></i>
                <span className="font-bold text-sm ml-3">Account</span>
              </button>
              <button
                onClick=${() => handleAccountAction('settings')}
                className="w-full flex items-center px-4 py-3 text-left text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
              >
                <i className="fa-solid fa-sliders w-5 text-slate-400"></i>
                <span className="font-bold text-sm ml-3">Settings</span>
              </button>
              <div className="border-t border-slate-800 my-1"></div>
              <button
                onClick=${() => handleAccountAction('logout')}
                className="w-full flex items-center px-4 py-3 text-left text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all"
              >
                <i className="fa-solid fa-sign-out w-5"></i>
                <span className="font-bold text-sm ml-3">Logout</span>
              </button>
            </div>
          </div>
        `}
      </div>
    </div>
  `;
};

export default ChatTopBar;
