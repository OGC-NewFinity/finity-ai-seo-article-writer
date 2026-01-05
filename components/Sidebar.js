
import React from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fa-gauge-high' },
    { id: 'writer', label: 'SEO Writer', icon: 'fa-feather-pointed' },
    { id: 'research', label: 'Research Lab', icon: 'fa-microscope' },
    { id: 'settings', label: 'Settings', icon: 'fa-sliders' },
  ];

  return html`
    <div className="w-64 bg-slate-950 h-screen sticky top-0 text-slate-300 flex flex-col border-r border-slate-800/50">
      <div className="p-8 border-b border-slate-900 flex items-center space-x-4">
        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/40 transform rotate-3">
          <i className="fa-solid fa-bolt-lightning text-white text-lg"></i>
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-white tracking-tighter leading-none">FINITY</h1>
          <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1">SEO AGENT</span>
        </div>
      </div>
      
      <nav className="flex-1 mt-8 px-4 space-y-2">
        ${menuItems.map((item) => html`
          <button
            key=${item.id}
            onClick=${() => setActiveTab(item.id)}
            className=${`w-full flex items-center px-5 py-4 rounded-2xl transition-all duration-300 group ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' 
                : 'hover:bg-slate-900 hover:text-white'
            }`}
          >
            <i className=${`fa-solid ${item.icon} w-6 text-sm transition-all ${activeTab === item.id ? 'opacity-100 scale-110' : 'opacity-30 group-hover:opacity-60'}`}></i>
            <span className="font-bold text-sm tracking-tight">${item.label}</span>
          </button>
        `)}
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
