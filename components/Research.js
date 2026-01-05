
import React, { useState } from 'react';
import htm from 'htm';
import { performResearch } from '../services/geminiService.js';

const html = htm.bind(React.createElement);

const Research = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleResearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await performResearch(query);
      setResults(data);
    } catch (e) {
      alert("Research error. Verify API key.");
    } finally {
      setLoading(false);
    }
  };

  return html`
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center">
        <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Research Intelligence</h2>
        <p className="text-slate-500 mb-10 font-medium">Powering your articles with real-time web grounding.</p>
        
        <div className="relative max-w-2xl mx-auto group">
          <input 
            type="text" 
            className="w-full pl-14 pr-36 py-5 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-blue-100 focus:outline-none text-lg font-bold text-slate-700 transition-all placeholder-slate-400"
            placeholder="Search for recent stats or news..."
            value=${query}
            onChange=${e => setQuery(e.target.value)}
            onKeyDown=${e => e.key === 'Enter' && handleResearch()}
          />
          <i className="fa-solid fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"></i>
          <button 
            disabled=${loading}
            onClick=${handleResearch}
            className="absolute right-2.5 top-2.5 bottom-2.5 bg-slate-900 text-white px-8 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all shadow-lg shadow-slate-200"
          >
            ${loading ? html`<i className="fa-solid fa-spinner fa-spin"></i>` : 'Analyze'}
          </button>
        </div>
      </div>

      ${results && html`
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-black mb-6 text-slate-800 uppercase tracking-widest text-xs">Research Summary</h3>
              <div className="prose prose-blue text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                ${results.summary}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-xs font-black mb-6 flex items-center text-slate-800 uppercase tracking-widest">
                <i className="fa-solid fa-link text-blue-600 mr-2"></i>
                Grounding Sources
              </h3>
              <ul className="space-y-4">
                ${results.sources.map((src, i) => html`
                  <li key=${i}>
                    <a 
                      href=${src.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block p-4 bg-slate-50 rounded-2xl hover:bg-blue-50 transition-all group border border-slate-100"
                    >
                      <span className="text-xs text-slate-800 font-black block truncate mb-1">${src.title}</span>
                      <span className="text-[10px] text-slate-400 font-bold truncate block">${src.uri}</span>
                    </a>
                  </li>
                `)}
                ${results.sources.length === 0 && html`
                  <p className="text-xs text-slate-400 text-center py-6 font-bold">No external links found.</p>
                `}
              </ul>
            </div>
          </div>
        </div>
      `}
    </div>
  `;
};

export default Research;
