
import React from 'react';
import htm from 'htm';
import { useLocation, useNavigate } from 'react-router-dom';

const html = htm.bind(React.createElement);

const Sidebar = ({ activeTab, setActiveTab }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine if we're in route-based navigation (media routes) or tab-based
  const isRouteBased = location.pathname.startsWith('/media');
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-gauge-high', route: '/dashboard', tabId: 'dashboard' },
    { id: 'writer', label: 'SEO Writer', icon: 'fa-feather-pointed', route: '/dashboard', tabId: 'writer' },
    { id: 'mediahub', label: 'Media Hub', icon: 'fa-photo-film', route: '/media', tabId: 'mediahub' },
    { id: 'research', label: 'Research Lab', icon: 'fa-microscope', route: '/dashboard', tabId: 'research' },
    { id: 'account', label: 'Account', icon: 'fa-user-circle', route: '/dashboard', tabId: 'account' },
    { id: 'settings', label: 'Settings', icon: 'fa-sliders', route: '/dashboard', tabId: 'settings' },
  ];

  const handleClick = (item) => {
    if (isRouteBased || item.id === 'mediahub') {
      // Use routing for media hub or when already in route-based mode
      navigate(item.route);
    } else if (setActiveTab) {
      // Use tab-based navigation for other items when in AppContent
      setActiveTab(item.tabId);
    }
  };

  const isActive = (item) => {
    if (isRouteBased) {
      // In route-based mode, check if pathname matches
      if (item.id === 'mediahub') {
        return location.pathname.startsWith('/media');
      }
      return location.pathname === item.route;
    } else {
      // In tab-based mode, use activeTab
      return activeTab === item.tabId;
    }
  };

  return html`
    <div className="w-64 bg-slate-950 h-screen sticky top-0 text-slate-300 flex flex-col border-r border-slate-800/50">
      <div className="p-8 border-b border-slate-900 flex items-center justify-center">
        <img 
          src="/brand-identity/logo/nova-logo.png" 
          alt="Nova‑XFinity AI Logo" 
          className="sidebar-logo w-12 h-12 object-contain"
        />
      </div>
      
      <nav className="flex-1 mt-8 px-4 space-y-2">
        ${menuItems.map((item) => {
          const active = isActive(item);
          return html`
          <button
            key=${item.id}
            onClick=${() => handleClick(item)}
            className=${`w-full flex items-center px-5 py-4 rounded-2xl transition-all duration-300 group ${
              active
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' 
                : 'hover:bg-slate-900 hover:text-white'
            }`}
          >
            <i className=${`fa-solid ${item.icon} w-6 text-sm transition-all ${active ? 'opacity-100 scale-110' : 'opacity-30 group-hover:opacity-60'}`}></i>
            <span className="font-bold text-sm tracking-tight">${item.label}</span>
          </button>
        `})}
      </nav>

      <div className="p-8 mt-auto">
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Engine Status</div>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-500/50"></div>
                    <span className="text-[10px] text-slate-300 font-bold uppercase">Connected</span>
                </div>
                <span className="text-[9px] text-slate-600 font-black">v2.1.0</span>
            </div>
        </div>
      </div>
    </div>
  `;
};

export default Sidebar;
