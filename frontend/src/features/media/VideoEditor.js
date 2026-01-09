
import React from 'react';
import htm from 'htm';
import { VIDEO_DURATION_OPTIONS } from '../../../../constants.js';

const html = htm.bind(React.createElement);

const VideoEditor = ({ duration, setDuration, withVoice, setWithVoice }) => {
  return html`
    <div className="space-y-6 animate-fadeIn">
      <div>
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Video Duration</label>
        <div className="grid grid-cols-3 gap-2">
          ${VIDEO_DURATION_OPTIONS.map(d => html`
            <button 
              key=${d}
              onClick=${() => setDuration(d)}
              className=${`py-2 rounded-xl text-[10px] font-black border transition-all ${duration === d ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-700'}`}
            >
              ${d}
            </button>
          `)}
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-slate-800 rounded-2xl border border-slate-700">
        <div className="flex items-center space-x-3">
          <i className=${`fa-solid fa-microphone-lines text-blue-500 ${withVoice ? 'animate-pulse' : ''}`}></i>
          <span className="text-[10px] font-black text-slate-200 uppercase tracking-tight">AI Voiceover Introduction</span>
        </div>
        <button 
          onClick=${() => setWithVoice(!withVoice)}
          className=${`w-10 h-6 rounded-full transition-all relative ${withVoice ? 'bg-blue-600' : 'bg-slate-300'}`}
        >
          <div className=${`absolute top-1 w-4 h-4 bg-slate-100 rounded-full transition-all ${withVoice ? 'left-5' : 'left-1'}`}></div>
        </button>
      </div>
    </div>
  `;
};

export default VideoEditor;
