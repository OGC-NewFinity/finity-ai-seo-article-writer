
import React from 'react';
import htm from 'htm';
import CustomDropdown from '../../../../components/common/CustomDropdown.js';
import { ASPECT_RATIO_OPTIONS, VIDEO_ASPECT_RATIO_OPTIONS, IMAGE_STYLE_OPTIONS } from '../../../../constants.js';
import MediaUpload from './MediaUpload.js';
import VideoEditor from './VideoEditor.js';

const html = htm.bind(React.createElement);

const MediaHubParameters = ({ mode, style, setStyle, aspect, setAspect, duration, setDuration, withVoice, setWithVoice, sourceImage, onFileChange, prompt, setPrompt, onGenerate, loading }) => {
  return html`
    <section className="bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-800 space-y-6">
      <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest mb-4 flex items-center">
         <i className="fa-solid fa-sliders text-blue-600 mr-2"></i> Parameters
      </h3>
      
      <${CustomDropdown} label="Art Style" options=${IMAGE_STYLE_OPTIONS} value=${style} onChange=${setStyle} />
      <${CustomDropdown} 
        label="Aspect Ratio" 
        options=${mode === 'video' ? VIDEO_ASPECT_RATIO_OPTIONS : ASPECT_RATIO_OPTIONS} 
        value=${aspect} 
        onChange=${setAspect} 
      />

      ${mode === 'video' && html`
        <${VideoEditor}
          duration=${duration}
          setDuration=${setDuration}
          withVoice=${withVoice}
          setWithVoice=${setWithVoice}
        />
      `}

      ${(mode === 'edit' || mode === 'video') && html`
        <${MediaUpload}
          sourceImage=${sourceImage}
          onFileChange=${onFileChange}
        />
      `}

      <div className="pt-4">
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Instruction</label>
        <textarea 
          className="w-full px-5 py-4 bg-slate-900 text-white border border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:outline-none placeholder-slate-600 font-bold transition-all text-sm min-h-[120px] resize-none"
          placeholder="Describe your vision in detail. Be specific about style, composition, mood, and key elements..."
          value=${prompt}
          onChange=${e => setPrompt(e.target.value)}
        ></textarea>
      </div>

      <button 
        disabled=${loading || (mode === 'edit' && !sourceImage)}
        onClick=${onGenerate}
        className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95"
      >
        ${loading ? html`<i className="fa-solid fa-spinner fa-spin mr-2"></i> Processing your request...` : html`<i className="fa-solid fa-wand-magic-sparkles mr-2"></i> Synthesize`}
      </button>
    </section>
  `;
};

export default MediaHubParameters;
