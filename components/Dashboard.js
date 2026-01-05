
import React from 'react';
import htm from 'htm';
import { ROADMAP_DATA } from '../constants.js';

const html = htm.bind(React.createElement);

const Dashboard = () => {
  return html`
    <div className="space-y-8 animate-fadeIn">
      <header>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Agent Overview</h2>
        <p className="text-slate-500 mt-2 font-medium">Monitoring your SEO performance and content velocity.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${[
          { icon: 'fa-file-export', color: 'blue', value: '124', label: 'Articles Drafted' },
          { icon: 'fa-chart-line', color: 'emerald', value: '85%', label: 'Avg. SEO Score' },
          { icon: 'fa-bolt', color: 'purple', value: '0.8s', label: 'Response Time' }
        ].map((stat, i) => html`
          <div key=${i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center dashboard-card">
            <div className=${`w-12 h-12 bg-${stat.color}-50 rounded-xl flex items-center justify-center text-${stat.color}-600 mb-4`}>
              <i className=${`fa-solid ${stat.icon} text-lg`}></i>
            </div>
            <h3 className="text-2xl font-black text-slate-800">${stat.value}</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">${stat.label}</p>
          </div>
        `)}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h3 className="text-xl font-black mb-8 flex items-center text-slate-800">
          <i className="fa-solid fa-map text-blue-600 mr-3"></i>
          Development Roadmap
        </h3>
        <div className="relative border-l-2 border-slate-100 ml-4 space-y-10">
          ${ROADMAP_DATA.map((item, idx) => html`
            <div key=${idx} className="relative pl-10">
              <div className="absolute -left-[11px] top-0 w-5 h-5 bg-white rounded-full border-4 border-blue-600 shadow-sm"></div>
              <h4 className="font-black text-slate-800 text-sm">
                ${item.step} 
                <span className="text-[9px] bg-slate-100 px-2 py-0.5 rounded-md ml-3 font-black text-slate-500 uppercase tracking-widest">${item.tech}</span>
              </h4>
              <p className="text-slate-500 text-xs mt-2 leading-relaxed font-medium">${item.desc}</p>
            </div>
          `)}
        </div>
      </div>

      <div className="bg-slate-900 p-10 rounded-3xl text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-blue-600 opacity-10 rounded-full -mr-20 -mb-20 blur-3xl group-hover:opacity-20 transition-all"></div>
        <h3 className="text-2xl font-black mb-3">Optimize for WordPress</h3>
        <p className="text-slate-400 leading-relaxed max-w-2xl font-medium text-sm">
          Integrating with the WordPress REST API ensures that your generated content is automatically synced as a draft. 
          Use our provided PHP controller to handle background processing safely.
        </p>
        <button className="mt-6 px-8 py-3 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/20">
          View API Docs
        </button>
      </div>
    </div>
  `;
};

export default Dashboard;
