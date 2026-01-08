
import React from 'react';
import htm from 'htm';
import AudioBlock from './AudioBlock.js';
import FeedbackWidget from '../../components/common/FeedbackWidget.js';

const html = htm.bind(React.createElement);

const MediaOutput = ({ mode, loading, statusMessage, resultImage, resultVideo, resultAudio, provider = 'GEMINI', model = 'gemini-3-pro-preview', prompt, style, aspect }) => {
  return html`
    <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 min-h-[650px] flex flex-col">
       <div className="flex items-center justify-between mb-8">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center">
            <i className=${`fa-solid ${resultVideo ? 'fa-clapperboard' : 'fa-image'} text-blue-600 mr-2`}></i> Output Preview
          </h3>
          ${(resultImage || resultVideo) && html`
            <button onClick=${() => {
              const link = document.createElement('a');
              link.href = resultImage || resultVideo;
              link.download = resultVideo ? 'finity-video.mp4' : 'finity-asset.png';
              link.click();
            }} className="text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center hover:bg-blue-50 px-4 py-2 rounded-lg transition-all">
              <i className="fa-solid fa-download mr-2"></i> Download
            </button>
          `}
       </div>

       <div className="flex-1 bg-slate-50 rounded-3xl border border-slate-100 relative overflow-hidden flex flex-col items-center justify-center p-6">
          ${loading ? html`
            <div className="flex flex-col items-center space-y-6">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl animate-pulse">
                <i className=${`fa-solid ${mode === 'video' ? 'fa-clapperboard' : 'fa-wand-magic-sparkles'} text-3xl text-blue-500`}></i>
              </div>
              <div className="text-center">
                <p className="text-slate-800 font-black text-xs uppercase tracking-widest animate-pulse">${statusMessage || 'Synthesizing...'}</p>
              </div>
            </div>
          ` : resultVideo ? html`
            <div className="space-y-6 w-full">
              <video src=${resultVideo} controls autoPlay loop className="max-w-full max-h-[500px] rounded-2xl shadow-2xl border border-white animate-fadeIn mx-auto" />
              ${resultAudio && html`
                <${AudioBlock} audioUrl=${resultAudio} />
              `}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <${FeedbackWidget}
                  contentType="VIDEO"
                  provider=${provider}
                  model=${model}
                  metadata=${{ prompt, style, aspect, duration, resolution, withVoice: !!resultAudio }}
                  variant="stars"
                  showComment=${true}
                />
              </div>
            </div>
          ` : resultImage ? html`
            <div className="space-y-6 w-full">
              <img src=${resultImage} className="max-w-full max-h-[500px] rounded-2xl shadow-2xl border border-white animate-fadeIn mx-auto" />
              <div className="mt-6 pt-6 border-t border-slate-200">
                <${FeedbackWidget}
                  contentType="IMAGE"
                  provider=${provider}
                  model=${model}
                  metadata=${{ prompt, style, aspect, mode: mode === 'edit' ? 'edit' : 'generate' }}
                  variant="stars"
                  showComment=${true}
                />
              </div>
            </div>
          ` : html`
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                 <i className=${`fa-solid ${mode === 'video' ? 'fa-video' : 'fa-mountain-sun'} text-4xl text-slate-200`}></i>
              </div>
              <p className="text-slate-400 font-medium text-sm max-w-xs mx-auto">Ready to synthesize custom brand assets.</p>
            </div>
          `}
       </div>
    </div>
  `;
};

export default MediaOutput;
