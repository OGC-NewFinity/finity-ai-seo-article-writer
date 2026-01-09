
import React from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const MediaHubHeader = ({ mode, setMode }) => {
  return html`
    <header className="flex justify-between items-end">
      <div>
        <h2 className="text-3xl font-black text-white tracking-tight">Nova‑XFinity Media Hub</h2>
        <p className="text-slate-400 mt-2 font-medium">Generate high-impact assets with Veo 3.1 & Gemini Multimodal.</p>
      </div>
      <div className="flex bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
         ${['generate', 'edit', 'video'].map(m => html`
           <button 
             key=${m}
             onClick=${() => setMode(m)} 
             className=${`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === m ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-300'}`}
           >
             ${m === 'video' ? 'Video Gen' : m.charAt(0).toUpperCase() + m.slice(1)}
           </button>
         `)}
      </div>
    </header>
  `;
};

export default MediaHubHeader;
