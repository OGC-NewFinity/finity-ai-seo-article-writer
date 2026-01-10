
import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.js';
import Tooltip from '@/components/common/Tooltip.js';

const html = htm.bind(React.createElement);

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Check localStorage for saved state
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const menuItems = [
    { id: 'assistant', label: 'AI Assistant', icon: 'fa-comments', route: '/dashboard/assistant' },
    { id: 'articles', label: 'SEO Writer', icon: 'fa-feather-pointed', route: '/dashboard/articles' },
    { id: 'mediahub', label: 'Media Hub', icon: 'fa-photo-film', route: '/media' },
    { id: 'research', label: 'Research Lab', icon: 'fa-microscope', route: '/dashboard/research' },
    // Admin-only items
    ...(isAdmin ? [
      { id: 'admin', label: 'Admin', icon: 'fa-shield-halved', route: '/admin', adminOnly: true },
      { id: 'admin-settings', label: 'Admin Settings', icon: 'fa-cog', route: '/admin/settings', adminOnly: true }
    ] : [])
  ];

  const handleClick = (item) => {
    navigate(item.route);
  };

  const isActive = (item) => {
    // Check if current pathname matches the route or starts with it for nested routes
    if (item.id === 'assistant') {
      return location.pathname === '/dashboard/assistant' || (location.pathname === '/dashboard' && item.id === 'assistant');
    }
    if (item.id === 'mediahub') {
      return location.pathname.startsWith('/media');
    }
    if (item.id === 'admin-settings') {
      return location.pathname === '/admin/settings';
    }
    if (item.id === 'admin') {
      return location.pathname === '/admin';
    }
    return location.pathname === item.route || location.pathname.startsWith(item.route + '/');
  };

  return html`
    <div className=${`${isCollapsed ? 'w-20' : 'w-64'} bg-slate-950 h-screen sticky top-0 text-slate-300 flex flex-col border-r border-slate-800/50 transition-all duration-300`}>
      <!-- Header -->
      <div className="p-8 border-b border-slate-900 flex items-center justify-center relative">
        ${isCollapsed ? html`
          <img 
            src="/brand-identity/logo/nova-logo.png" 
            alt="Nova‑XFinity AI Logo" 
            className="sidebar-logo w-8 h-8 object-contain"
          />
        ` : html`
          <img 
            src="/brand-identity/logo/nova-logo.png" 
            alt="Nova‑XFinity AI Logo" 
            className="sidebar-logo w-12 h-12 object-contain"
          />
        `}
      </div>
      
      <!-- Toggle Button (Sticky) -->
      <div className="absolute top-4 right-2 z-10">
        <${Tooltip} text=${isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'} position="right">
          <button
            onClick=${() => setIsCollapsed(!isCollapsed)}
            className="w-6 h-6 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-800 transition-all text-slate-400 hover:text-white"
          >
            <i className=${`fa-solid ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'} text-xs`}></i>
          </button>
        </${Tooltip}>
      </div>
      
      <!-- Navigation -->
      <nav className="flex-1 mt-8 px-4 space-y-2">
        ${menuItems.filter(item => !item.adminOnly || isAdmin).map((item) => {
          const active = isActive(item);
          
          const menuButton = html`
            <button
              key=${item.id}
              onClick=${() => handleClick(item)}
              className=${`w-full flex items-center ${isCollapsed ? 'justify-center px-3' : 'px-5'} py-4 rounded-2xl transition-all duration-300 group ${
                active
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' 
                  : item.adminOnly
                  ? 'hover:bg-purple-900/30 hover:text-purple-300 border border-purple-800/30'
                  : 'hover:bg-slate-900 hover:text-white'
              }`}
            >
              <i className=${`fa-solid ${item.icon} ${isCollapsed ? 'w-5' : 'w-6'} text-sm transition-all ${active ? 'opacity-100 scale-110' : 'opacity-30 group-hover:opacity-60'}`}></i>
              ${!isCollapsed && html`
                <span className="font-bold text-sm tracking-tight ml-3">${item.label}</span>
              `}
              ${!isCollapsed && item.adminOnly && html`
                <span className="ml-auto text-[8px] font-black text-purple-400 uppercase">Admin</span>
              `}
            </button>
          `;

          // If collapsed, wrap in tooltip
          if (isCollapsed) {
            return html`
              <${Tooltip} key=${item.id} text=${item.label} position="right">
                <div>${menuButton}</div>
              </${Tooltip}>
            `;
          }
          return menuButton;
        })}
      </nav>

      <!-- Bottom Status/Usage Indicator -->
      <div className="p-8 mt-auto">
        ${isCollapsed ? html`
          <${Tooltip} text="Engine Status: Connected v2.1.0" position="right">
            <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50 flex items-center justify-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-500/50"></div>
            </div>
          </${Tooltip}>
        ` : html`
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Engine Status</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-500/50"></div>
                <span className="text-[10px] text-slate-300 font-bold uppercase">Connected</span>
              </div>
              <span className="text-[9px] text-slate-600 font-black">v2.1.0</span>
            </div>
            <!-- Optional: Token Usage Indicator (Battery-style) -->
            <div className="mt-3 pt-3 border-t border-slate-800">
              <${Tooltip} text="Token Usage: 75% remaining" position="top">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Usage</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-8 h-4 border border-slate-700 rounded-sm relative overflow-hidden bg-slate-900">
                      <div className="absolute left-0 top-0 h-full bg-blue-500" style=${{ width: '75%' }}></div>
                      <div className="absolute right-[-2px] top-1/2 -translate-y-1/2 w-1 h-2 bg-slate-700 rounded-r-sm"></div>
                    </div>
                  </div>
                </div>
              </${Tooltip}>
            </div>
          </div>
        `}
      </div>
    </div>
  `;
};

export default Sidebar;
