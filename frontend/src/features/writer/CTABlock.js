
import React, { useState } from 'react';
import htm from 'htm';
import { generateCTA } from '../../services/geminiArticleService.js';
import FeedbackWidget from '../../components/common/FeedbackWidget.js';

const html = htm.bind(React.createElement);

const CTABlock = ({ topic, keywords, focusKeyphrase, onCTAGenerated, existingCTA, provider, model }) => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(existingCTA || '');

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateCTA(topic, keywords, focusKeyphrase);
      setContent(result);
      if (onCTAGenerated) onCTAGenerated(result);
    } catch (e) {
      console.error(e);
      alert("CTA generation failed.");
    } finally {
      setLoading(false);
    }
  };

  return html`
    <div className="mt-20 p-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] shadow-2xl shadow-blue-500/10">
      <div className="bg-slate-900 rounded-[2.4rem] p-12 relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <i className="fa-solid fa-rocket text-9xl text-white"></i>
        </div>
        
        <div className="relative z-10">
          ${content ? html`
            <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-8">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20 flex items-center">
                  <i className="fa-solid fa-flag-checkered mr-2"></i>
                  Final Conversion Layer
                </span>
                <button onClick=${() => setContent('')} className="text-slate-500 hover:text-white transition-colors p-2">
                  <i className="fa-solid fa-rotate-right"></i>
                </button>
              </div>
              <div className="prose prose-invert prose-lg max-w-none text-slate-200 editor-html-content" dangerouslySetInnerHTML=${{ __html: content }} />
              <div className="mt-12 pt-8 border-t border-slate-800 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                     <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <i className="fa-solid fa-bolt text-xs text-white"></i>
                     </div>
                     <div className="flex flex-col">
                        <span className="text-xs font-black text-white uppercase tracking-tight">Nova‑XFinity AI Optimized</span>
                        <span className="text-[10px] font-bold text-slate-500">Branded Engagement Sync Active</span>
                     </div>
                  </div>
                  <button 
                    onClick=${() => {
                      navigator.clipboard.writeText(content);
                      alert("CTA HTML copied to clipboard.");
                    }}
                    className="px-8 py-3.5 bg-slate-800 text-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-900/30 transition-all active:scale-95 shadow-xl border border-slate-700"
                  >
                    <i className="fa-solid fa-copy mr-2"></i> Copy CTA HTML
                  </button>
                </div>
                ${provider && html`
                  <div className="pt-6 border-t border-slate-800">
                    <${FeedbackWidget}
                      contentType="ARTICLE_CTA"
                      provider=${provider}
                      model=${model}
                      metadata=${{ topic, keywords, focusKeyphrase }}
                      variant="stars"
                      showComment=${true}
                      className="bg-slate-800/50 p-4 rounded-xl"
                    />
                  </div>
                `}
              </div>
            </div>
          ` : html`
            <div className="flex flex-col items-center text-center py-12">
               <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-8 border border-slate-700">
                  <i className="fa-solid fa-wand-magic-sparkles text-3xl text-blue-500"></i>
               </div>
               <h4 className="text-3xl font-black text-white mb-4 tracking-tight">Synthesize Final Call to Action</h4>
               <p className="text-slate-400 text-base font-medium max-w-lg mb-10 leading-relaxed">
                 Generate a compelling conclusion that encourages readers to engage with the content or discover the scaling power of Nova‑XFinity AI for their own projects.
               </p>
               <button 
                 onClick=${handleGenerate}
                 disabled=${loading}
                 className="px-12 py-5 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30 disabled:opacity-50 active:scale-95 flex items-center"
               >
                 ${loading ? html`<i className="fa-solid fa-spinner fa-spin mr-3"></i>Initializing Engine...` : html`<i className="fa-solid fa-paper-plane mr-3"></i>Generate Branded Conversion Block`}
               </button>
            </div>
          `}
        </div>
      </div>
    </div>
  `;
};

export default CTABlock;
