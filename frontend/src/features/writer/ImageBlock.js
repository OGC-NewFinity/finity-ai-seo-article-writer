
import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { generateImage, editImage } from '../../services/geminiMediaService.js';
import { showError } from '../../utils/errorHandler.js';

const html = htm.bind(React.createElement);

const ImageBlock = ({ rawContent, metadata: propMetadata, onImageGenerated, autoTrigger = false, label = "Nova‑XFinity Media Hub Placeholder" }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState(propMetadata || null);
  const [showEdit, setShowEdit] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');

  useEffect(() => {
    if (rawContent && !propMetadata) {
      const match = rawContent.match(/<!-- IMAGE_PROMPT: (.*?) -->/);
      if (match) {
        try {
          const parsed = JSON.parse(match[1]);
          setMetadata(parsed);
        } catch (e) {
          console.error("Failed to parse image prompt metadata", e);
        }
      }
    } else if (propMetadata) {
      setMetadata(propMetadata);
    }
  }, [rawContent, propMetadata]);

  const handleGenerate = async () => {
    if (!metadata || loading) return;
    setLoading(true);
    try {
      const visualPrompt = metadata.prompt || metadata.alt;
      const url = await generateImage(visualPrompt, metadata.aspect, metadata.style);
      setImageUrl(url);
      if (onImageGenerated) onImageGenerated(url);
    } catch (e) {
      console.error(e);
      showError(e, 'IMAGE_GENERATION_FAILED');
    } finally {
      setLoading(false);
    }
  };

  const handleAIEdit = async () => {
    if (!imageUrl || !editPrompt.trim()) return;
    setLoading(true);
    try {
      const url = await editImage(imageUrl, 'image/png', editPrompt, metadata.aspect);
      setImageUrl(url);
      setShowEdit(false);
      setEditPrompt('');
    } catch (e) {
      console.error(e);
      showError(e, 'IMAGE_GENERATION_FAILED');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoTrigger && metadata && !imageUrl && !loading) {
      handleGenerate();
    }
  }, [autoTrigger, metadata]);

  if (!metadata) return null;

  return html`
    <div className="my-10 bg-slate-800 border-2 border-dashed border-slate-700 rounded-3xl p-8 transition-all hover:bg-blue-900/30 group relative overflow-hidden">
      ${imageUrl ? html`
        <div className="space-y-4 animate-fadeIn">
          <div className="relative overflow-hidden rounded-2xl shadow-xl border border-slate-700">
            <img src=${imageUrl} alt=${metadata.alt} className="w-full h-auto block" />
            <div className="absolute top-4 right-4 flex space-x-2">
               <button onClick=${() => setShowEdit(!showEdit)} className="p-3 bg-slate-900/90 backdrop-blur rounded-xl text-slate-200 hover:text-blue-500 transition-colors shadow-lg border border-slate-700" title="Refine with AI">
                <i className="fa-solid fa-sparkles"></i>
               </button>
               <button onClick=${() => setImageUrl(null)} className="p-3 bg-slate-900/90 backdrop-blur rounded-xl text-slate-200 hover:text-red-400 transition-colors shadow-lg border border-slate-700">
                <i className="fa-solid fa-trash-can"></i>
               </button>
            </div>

            ${showEdit && html`
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 animate-fadeIn">
                <div className="bg-slate-900 w-full max-w-sm p-8 rounded-3xl shadow-2xl border border-slate-800">
                   <h6 className="text-xs font-black text-white uppercase tracking-widest mb-4">AI Refinement</h6>
                   <textarea 
                     value=${editPrompt}
                     onChange=${e => setEditPrompt(e.target.value)}
                     className="w-full p-4 bg-slate-800 border border-slate-700 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/50 mb-4 h-24 resize-none text-white placeholder-slate-500"
                     placeholder="Describe your desired changes. Examples: 'Make it look vintage with warm sepia tones', 'Add a retro filter with film grain', 'Enhance colors for a vibrant look'..."
                   ></textarea>
                   <div className="flex space-x-3">
                      <button onClick=${handleAIEdit} disabled=${loading || !editPrompt.trim()} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20">
                        ${loading ? 'Refining...' : 'Apply Edits'}
                      </button>
                      <button onClick=${() => setShowEdit(false)} className="px-5 py-3 bg-slate-800 text-slate-300 rounded-xl font-black text-[10px] uppercase tracking-widest border border-slate-700 hover:bg-slate-700">Cancel</button>
                   </div>
                </div>
              </div>
            `}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center">
                  <i className="fa-solid fa-magnifying-glass mr-2 text-blue-400"></i> Alt Text (SEO Infused)
                </p>
                <p className="text-xs font-bold text-slate-200">${metadata.alt}</p>
             </div>
             <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center">
                  <i className="fa-solid fa-file-code mr-2 text-blue-400"></i> Filename
                </p>
                <code className="text-[10px] font-bold text-blue-400 block truncate">${metadata.filename}.webp</code>
             </div>
             <div className="md:col-span-2 bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center">
                  <i className="fa-solid fa-quote-left mr-2 text-blue-400"></i> Caption
                </p>
                <p className="text-xs font-medium text-slate-300">${metadata.caption}</p>
             </div>
          </div>
        </div>
      ` : html`
        <div className="flex flex-col items-center justify-center text-center space-y-6 py-8">
          <div className=${`w-20 h-20 rounded-3xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500 group-hover:text-blue-500 group-hover:border-blue-600 group-hover:shadow-xl group-hover:shadow-blue-500/10 transition-all duration-500 ${loading ? 'animate-pulse scale-110 shadow-2xl shadow-blue-500/20 text-blue-500 border-blue-600' : ''}`}>
            <i className=${`fa-solid ${loading ? 'fa-wand-magic-sparkles fa-spin' : 'fa-image'} text-3xl`}></i>
          </div>
          <div>
            <h5 className="font-black text-white text-sm tracking-tight flex items-center justify-center">
              ${label}
              <span className="ml-2 text-[9px] bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded font-black uppercase tracking-widest">${metadata.aspect} | ${metadata.style}</span>
            </h5>
            <p className="text-xs text-slate-400 font-medium max-w-sm mt-1 leading-relaxed">
              Asset metadata primed with focus keyphrase. Ready to synthesize ${metadata.style} visuals for your WordPress content.
            </p>
          </div>
          <button 
            onClick=${handleGenerate}
            disabled=${loading}
            className="px-10 py-3.5 bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-blue-600 disabled:opacity-50 transition-all active:scale-95 shadow-xl shadow-black/50 border border-slate-700 group-hover:shadow-blue-500/20"
          >
            ${loading ? 'Synthesizing SEO Asset...' : 'Generate High-Quality Visual'}
          </button>
        </div>
      `}
    </div>
  `;
};

export default ImageBlock;
