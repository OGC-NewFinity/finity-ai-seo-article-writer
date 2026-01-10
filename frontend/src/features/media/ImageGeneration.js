import React, { useState } from 'react';
import htm from 'htm';
import { generateImage } from '@/services/geminiMediaService.js';
import CustomDropdown from '@/components/common/CustomDropdown.js';
import { ASPECT_RATIO_OPTIONS, IMAGE_STYLE_OPTIONS } from '@/constants.js';
import MediaOutput from './MediaOutput.js';
import MediaPresets from './MediaPresets.js';
import OnboardingBanner from '@/components/common/OnboardingBanner.js';
import Tooltip from '@/components/common/Tooltip.js';
import { showError } from '@/utils/errorHandler.js';

const html = htm.bind(React.createElement);

const ImageGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Photorealistic');
  const [aspect, setAspect] = useState('16:9');
  const [resolution, setResolution] = useState('720p');
  const [resultImage, setResultImage] = useState(null);
  const [seed, setSeed] = useState('');

  const handleGenerate = async (templatePrompt = null) => {
    const finalPrompt = templatePrompt ? `${templatePrompt}: ${prompt}` : prompt;
    if (!finalPrompt.trim()) return;
    setLoading(true);
    try {
      const url = await generateImage(finalPrompt, aspect, style);
      setResultImage(url);
    } catch (e) {
      console.error(e);
      showError(e, 'IMAGE_GENERATION_FAILED');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetClick = (presetPrompt) => {
    handleGenerate(presetPrompt);
  };

  return html`
    <div className="space-y-12 animate-fadeIn pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Image Generation</h2>
          <p className="text-slate-400 mt-2 font-medium">Transform your ideas into stunning visuals with the Nova‑XFinity AI Agent powered by Gemini Multimodal.</p>
        </div>
      </header>

      <${OnboardingBanner}
        id="image-generation-welcome"
        title="Welcome to Image Generation!"
        message="Choose your art style and aspect ratio, then enter a detailed prompt describing your vision. Be specific about colors, composition, mood, and key elements for best results."
        icon="fa-wand-magic-sparkles"
        type="info"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-8">
          <section className="bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-800 space-y-6">
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest mb-4 flex items-center">
              <i className="fa-solid fa-sliders text-blue-600 mr-2"></i> Parameters
            </h3>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Art Style</label>
                <${Tooltip} text="Select the artistic style for your generated image. Photorealistic creates lifelike visuals, while other styles offer creative variations." position="top">
                  <i className="fa-solid fa-circle-question text-slate-500 text-xs cursor-help hover:text-blue-400 transition-colors"></i>
                </${Tooltip}>
              </div>
              <${CustomDropdown} label="" options=${IMAGE_STYLE_OPTIONS} value=${style} onChange=${setStyle} />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Aspect Ratio</label>
                <${Tooltip} text="Choose the image dimensions. 16:9 is great for banners, 1:1 for social media, and 4:3 for traditional displays." position="top">
                  <i className="fa-solid fa-circle-question text-slate-500 text-xs cursor-help hover:text-blue-400 transition-colors"></i>
                </${Tooltip}>
              </div>
              <${CustomDropdown} 
                label="" 
                options=${ASPECT_RATIO_OPTIONS} 
                value=${aspect} 
                onChange=${setAspect} 
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Seed (Optional)
                </label>
                <${Tooltip} text="Use a seed value to generate the same image again. Leave empty for random generation each time." position="top">
                  <i className="fa-solid fa-circle-question text-slate-500 text-xs cursor-help hover:text-blue-400 transition-colors"></i>
                </${Tooltip}>
              </div>
              <input 
                type="text"
                className="w-full px-5 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:outline-none placeholder-slate-500 text-white font-medium text-sm"
                placeholder="Enter a seed value for reproducible results"
                value=${seed}
                onChange=${e => setSeed(e.target.value)}
              />
            </div>

            <div className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Prompt</label>
                <${Tooltip} text="Describe your image in detail. Include subject, style, colors, lighting, mood, and composition. More specific prompts yield better results." position="top">
                  <i className="fa-solid fa-circle-question text-slate-500 text-xs cursor-help hover:text-blue-400 transition-colors"></i>
                </${Tooltip}>
              </div>
              <textarea 
                className="w-full px-5 py-4 bg-slate-900 text-white border border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:outline-none placeholder-slate-600 font-bold transition-all text-sm min-h-[120px] resize-none"
                placeholder="Example: 'A serene mountain landscape at sunset with vibrant orange and pink skies, snow-capped peaks in the distance, cinematic lighting, photorealistic style'"
                value=${prompt}
                onChange=${e => setPrompt(e.target.value)}
              ></textarea>
              <p className="text-[9px] text-slate-500 mt-2 ml-1">💡 Tip: Be descriptive! Include details about colors, lighting, composition, and mood.</p>
            </div>

            <button 
              disabled=${loading || !prompt.trim()}
              onClick=${() => handleGenerate()}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95"
            >
              ${loading ? html`<i className="fa-solid fa-spinner fa-spin mr-2"></i> Processing your request...` : html`<i className="fa-solid fa-wand-magic-sparkles mr-2"></i> Generate Image`}
            </button>
          </section>

          <${MediaPresets}
            mode="generate"
            loading=${loading}
            onPresetClick=${handlePresetClick}
          />
        </div>

        <div className="lg:col-span-2 space-y-8">
          <${MediaOutput}
            mode="generate"
            loading=${loading}
            statusMessage=${loading ? 'Nova‑XFinity Engine is creating your image...' : ''}
            resultImage=${resultImage}
            resultVideo=${null}
            resultAudio=${null}
            provider="GEMINI"
            model="gemini-3-pro-preview"
            prompt=${prompt}
            style=${style}
            aspect=${aspect}
            duration=""
            resolution=${resolution}
          />
        </div>
      </div>
    </div>
  `;
};

export default ImageGeneration;