
import React, { useState } from 'react';
import htm from 'htm';
import Sidebar from './components/Sidebar.js';
import Dashboard from './components/Dashboard.js';
import Writer from './components/Writer.js';
import Research from './components/Research.js';

const html = htm.bind(React.createElement);

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return html`<${Dashboard} />`;
      case 'writer': return html`<${Writer} />`;
      case 'research': return html`<${Research} />`;
      case 'settings': return html`
        <div className="bg-white p-12 rounded-3xl border border-gray-100 max-w-2xl mx-auto text-center animate-fadeIn shadow-xl shadow-slate-200/50">
          <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i className="fa-solid fa-gears text-4xl text-slate-300"></i>
          </div>
          <h2 className="text-2xl font-black mb-2 text-slate-800 tracking-tight">Plugin Configuration</h2>
          <p className="text-slate-500 mb-10 font-medium">Configure your WordPress Agent for the Gemini API.</p>
          
          <div className="space-y-6 text-left">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">WP REST API Context</label>
              <div className="relative">
                <input type="password" value="************************" readOnly className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-not-allowed font-mono text-sm text-slate-400" />
                <i className="fa-solid fa-lock absolute right-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Preferred Generation Model</label>
              <div className="relative">
                <select className="w-full px-5 py-4 border border-slate-200 rounded-2xl bg-white focus:ring-4 focus:ring-blue-50 font-bold text-slate-700 text-sm appearance-none outline-none transition-all">
                  <option>Gemini 3 Pro (Best Quality)</option>
                  <option>Gemini 3 Flash (High Speed)</option>
                </select>
                <i className="fa-solid fa-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
              </div>
            </div>

            <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest mt-4 hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-200">
              Save Plugin Settings
            </button>
          </div>
        </div>
      `;
      default: return html`<${Dashboard} />`;
    }
  };

  return html`
    <div className="flex min-h-screen bg-gray-50 selection:bg-blue-100 selection:text-blue-900">
      <${Sidebar} activeTab=${activeTab} setActiveTab=${setActiveTab} />
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          ${renderContent()}
        </div>
      </main>
    </div>
  `;
};

export default App;
