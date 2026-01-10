
import React from 'react';
import htm from 'htm';
import { PROVIDER_OPTIONS } from '@/constants.js';
import { showError } from '@/utils/errorHandler.js';

const html = htm.bind(React.createElement);

const WriterToolbar = ({ sections, setAutoTriggerAllMedia, analyzeSEO, loading, setIsPublishingModalOpen, setShowDraftLibrary, savedDrafts, settings }) => {
  const activeProvider = PROVIDER_OPTIONS.find(p => p.id === settings.provider) || PROVIDER_OPTIONS[0];

  return html`
    <div className="bg-slate-900 px-8 py-5 flex justify-between items-center">
        <div className="flex items-center space-x-6">
           <h3 className="font-black text-white text-xs uppercase tracking-widest flex items-center"><i className="fa-solid fa-newspaper mr-3 text-blue-500"></i> Editor Workspace</h3>
           <button onClick=${() => setShowDraftLibrary(true)} className="text-[9px] font-black uppercase text-slate-500 hover:text-white transition-all"><i className="fa-solid fa-box-archive mr-2"></i> Draft Library (${savedDrafts.length})</button>
           <div className="flex items-center space-x-2 border-l border-slate-800 pl-6 ml-2">
              <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Engine: ${activeProvider.label}</span>
           </div>
        </div>
        <div className="flex space-x-3">
          <button onClick=${() => setAutoTriggerAllMedia(true)} disabled=${sections.length === 0} className="px-5 py-2.5 text-[10px] font-black uppercase bg-slate-800 text-white rounded-xl border border-slate-700 disabled:opacity-50"><i className="fa-solid fa-images mr-2 text-blue-400"></i> Nova‑XFinity Media</button>
          <button onClick=${analyzeSEO} disabled=${loading || sections.length === 0} className="px-5 py-2.5 text-[10px] font-black uppercase bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/10">SEO Audit</button>
          <button 
            onClick=${() => {
              if (sections.length === 0 || sections.some(s => !s.body)) {
                showError('Please generate all content blocks before publishing. Ensure all sections have content to continue.', 'VALIDATION_ERROR');
                return;
              }
              setIsPublishingModalOpen(true);
            }} 
            className="px-5 py-2.5 text-[10px] font-black uppercase bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/10 transition-all hover:bg-blue-700 active:scale-95"
          >
            Publish to WordPress
          </button>
        </div>
    </div>
  `;
};

export default WriterToolbar;
