import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { performResearch } from '@/services/geminiResearchService.js';
import OnboardingBanner from '@/components/common/OnboardingBanner.js';
import Tooltip from '@/components/common/Tooltip.js';

const html = htm.bind(React.createElement);

const Research = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Initializing search engine...');
  const [results, setResults] = useState(null);

  const quickSearches = [
    { label: "Market Statistics 2024", prompt: "Find the latest 2024 statistics for: " },
    { label: "Content Trends", prompt: "Identify recent content marketing trends regarding: " },
    { label: "Competitive Analysis", prompt: "Perform a brief competitive landscape analysis for: " },
    { label: "Latest News", prompt: "What is the breaking news today about: " }
  ];

  const handleResearch = async (templatePrefix = '') => {
    // If template is used, we combine it with the query or just use the template if query is empty
    const finalQuery = templatePrefix ? (query ? `${templatePrefix} ${query}` : `${templatePrefix} relevant current topics`) : query;
    if (!finalQuery.trim()) return;

    setLoading(true);
    setResults(null);
    
    // Cycle through status messages to provide feedback
    const statuses = [
      "Accessing Google Search index...",
      "Filtering for high-authority sources...",
      "Synthesizing grounding metadata...",
      "Analyzing competitive landscape...",
      "Generating technical summary..."
    ];
    let sIdx = 0;
    const interval = setInterval(() => {
      setStatusMsg(statuses[sIdx % statuses.length]);
      sIdx++;
    }, 3000);

    try {
      // Example: Basic research query
      // const data = await performResearch(finalQuery);
      
      // Example: Research with options (focus, maxResults, timeRange)
      const data = await performResearch(finalQuery, {
        focus: 'all', // 'statistics' | 'trends' | 'news' | 'analysis' | 'all'
        maxResults: 10,
        timeRange: 'all' // 'day' | 'week' | 'month' | 'year' | 'all'
      });
      
      setResults(data);
    } catch (e) {
      console.error(e);
      alert("Research error. Verify connectivity and API key status.");
    } finally {
      clearInterval(interval);
      setLoading(false);
      setStatusMsg('Indexing complete.');
    }
  };

  return html`
    <div className="max-w-6xl mx-auto space-y-12 animate-fadeIn pb-20">
      <div className="bg-slate-900 p-12 rounded-[2.5rem] shadow-sm border border-slate-800 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 opacity-20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white mb-3 tracking-tight">Research Intelligence Lab</h2>
          <p className="text-slate-400 mb-8 font-medium max-w-xl mx-auto">Ground your articles and campaigns in real-time web data using the Gemini Search Grounding engine.</p>
          
          <${OnboardingBanner}
            id="research-welcome"
            title="Welcome to Research Intelligence Lab!"
            message="Enter your research query to get real-time, grounded information from the web. Our AI will analyze sources and synthesize findings with citations. Use quick search buttons for common queries."
            icon="fa-microscope"
            type="info"
          />

          <div className="relative max-w-3xl mx-auto group">
            <div className="flex items-center gap-2 mb-3 justify-center">
              <${Tooltip} text="Enter your research question or topic. Be specific for better results. Examples: 'Latest statistics on AI adoption in healthcare', 'Current trends in renewable energy 2024'." position="bottom">
                <i className="fa-solid fa-circle-question text-slate-400 text-sm cursor-help hover:text-blue-400 transition-colors"></i>
              </${Tooltip}>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Research Query</span>
            </div>
            <input 
              type="text" 
              className="w-full pl-16 pr-44 py-6 bg-slate-800 border border-slate-700 rounded-[2rem] focus:ring-8 focus:ring-blue-900/50 focus:outline-none text-xl font-bold text-white transition-all placeholder-slate-500 shadow-inner"
              placeholder="Example: 'Latest statistics on React framework adoption in enterprise applications'"
              value=${query}
              onChange=${e => setQuery(e.target.value)}
              onKeyDown=${e => e.key === 'Enter' && handleResearch()}
              disabled=${loading}
            />
            <div className="absolute left-6 top-1/2 -translate-y-1/2">
               <i className=${`fa-solid ${loading ? 'fa-circle-notch fa-spin text-blue-500' : 'fa-magnifying-glass text-slate-400'} text-xl transition-colors`}></i>
            </div>
            <button 
              disabled=${loading || !query.trim()}
              onClick=${() => handleResearch()}
              className="absolute right-3 top-3 bottom-3 bg-slate-900 text-white px-10 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all shadow-xl shadow-slate-200 flex items-center"
            >
              ${loading ? 'Analyzing...' : 'Deep Research'}
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
             ${quickSearches.map(s => html`
               <button 
                 key=${s.label}
                 onClick=${() => handleResearch(s.prompt)}
                 disabled=${loading}
                 className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-[10px] font-black text-slate-300 uppercase tracking-widest hover:border-blue-500 hover:text-blue-400 transition-all disabled:opacity-30"
               >
                 ${s.label}
               </button>
             `)}
          </div>
          
          ${loading && html`
            <div className="mt-8 animate-fadeIn">
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2">${statusMsg}</p>
              <div className="w-48 h-1 bg-slate-800 rounded-full mx-auto overflow-hidden border border-slate-700">
                <div className="bg-blue-600 h-full w-1/3 animate-progressLoop"></div>
              </div>
            </div>
          `}
        </div>
      </div>

      ${results && html`
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-slate-900 p-12 rounded-[2.5rem] shadow-sm border border-slate-800 relative">
              <div className="absolute top-8 right-12 flex items-center space-x-2">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                 <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Grounded Result</span>
              </div>
              <h3 className="text-xs font-black mb-10 text-slate-100 uppercase tracking-widest flex items-center">
                 <i className="fa-solid fa-file-lines text-blue-600 mr-3 text-lg"></i> Research Synthesis
              </h3>
              <div className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed font-medium whitespace-pre-wrap editor-html-content">
                ${results.summary}
              </div>
              
              <div className="mt-12 pt-8 border-t border-slate-800 flex justify-between items-center">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Citations provided by Google Search Tooling</p>
                <button 
                  onClick=${() => {
                    navigator.clipboard.writeText(results.summary);
                    alert("Research copied to clipboard.");
                  }}
                  className="px-6 py-2 bg-slate-800 text-slate-300 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700"
                >
                  <i className="fa-solid fa-copy mr-2"></i> Copy Summary
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                 <i className="fa-brands fa-google text-6xl text-white"></i>
              </div>
              <h3 className="text-[10px] font-black mb-8 flex items-center text-white uppercase tracking-widest relative z-10">
                <i className="fa-solid fa-link text-blue-400 mr-3"></i>
                Grounding Sources
              </h3>
              <ul className="space-y-4 relative z-10">
                ${results.sources.map((src, i) => html`
                  <li key=${i} className="animate-fadeIn" style=${{ animationDelay: `${i * 0.1}s` }}>
                    <a 
                      href=${src.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block p-5 bg-slate-800/50 border border-slate-700/50 rounded-2xl hover:bg-blue-600 hover:border-blue-500 transition-all group shadow-sm"
                    >
                      <span className="text-[11px] text-white font-black block truncate mb-1 group-hover:text-white">${src.title}</span>
                      <span className="text-[9px] text-slate-500 font-bold truncate block group-hover:text-blue-100">${src.uri}</span>
                    </a>
                  </li>
                `)}
                ${results.sources.length === 0 && html`
                  <div className="text-center py-10">
                     <i className="fa-solid fa-link-slash text-slate-700 text-3xl mb-4"></i>
                     <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">No direct sources indexed</p>
                  </div>
                `}
              </ul>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-sm">
               <h4 className="text-[10px] font-black text-slate-100 uppercase tracking-widest mb-4">Research Impact</h4>
               <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-slate-800">
                     <span className="text-[10px] font-bold text-slate-400 uppercase">Search Recency</span>
                     <span className="text-[10px] font-black text-blue-500 uppercase tracking-tight">Real-Time</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-800">
                     <span className="text-[10px] font-bold text-slate-400 uppercase">Grounding Mode</span>
                     <span className="text-[10px] font-black text-blue-500 uppercase tracking-tight">Live Web Analytics</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                     <span className="text-[10px] font-bold text-slate-400 uppercase">Trust Score</span>
                     <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tight">Verified</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      `}
    </div>
  `;
};

export default Research;
