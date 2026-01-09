import React, { useState, useRef } from 'react';
import htm from 'htm';
import { editImage } from '../../services/geminiMediaService.js';
import CustomDropdown from '../../../../components/common/CustomDropdown.js';
import { ASPECT_RATIO_OPTIONS, IMAGE_STYLE_OPTIONS } from '../../../../constants.js';
import MediaUpload from './MediaUpload.js';
import MediaOutput from './MediaOutput.js';
import OnboardingBanner from '../../../../components/common/OnboardingBanner.js';
import Tooltip from '../../../../components/common/Tooltip.js';

const html = htm.bind(React.createElement);

const ImageEditor = () => {
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Photorealistic');
  const [aspect, setAspect] = useState('16:9');
  const [resolution, setResolution] = useState('720p');
  const [resultImage, setResultImage] = useState(null);
  const [sourceImage, setSourceImage] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef(null);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSourceImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!sourceImage || !prompt.trim()) return;
    setLoading(true);
    setStatusMessage('Nova‑XFinity Engine is processing your image enhancements...');
    try {
      const url = await editImage(sourceImage, 'image/png', prompt, aspect);
      setResultImage(url);
    } catch (e) {
      console.error(e);
      alert("Image editing failed. Please ensure your image is uploaded and your instructions are clear, then try again.");
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  return html`
    <div className="space-y-12 animate-fadeIn pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Image Editing & Enhancement</h2>
          <p className="text-slate-400 mt-2 font-medium">Transform, enhance, and perfect your images with the Nova‑XFinity Media Composer AI.</p>
        </div>
      </header>

      <${OnboardingBanner}
        id="image-editor-welcome"
        title="Welcome to Image Editing!"
        message="Upload an image, then describe the changes you want. Our AI will enhance, upscale, adjust colors, or apply transformations based on your instructions."
        icon="fa-paintbrush"
        type="info"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-8">
          <section className="bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-800 space-y-6">
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest mb-4 flex items-center">
              <i className="fa-solid fa-sliders text-blue-600 mr-2"></i> Edit Controls
            </h3>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Source Image</label>
                <${Tooltip} text="Upload the image you want to edit. Supported formats: JPG, PNG, WEBP. Maximum file size: 10MB." position="top">
                  <i className="fa-solid fa-circle-question text-slate-500 text-xs cursor-help hover:text-blue-400 transition-colors"></i>
                </${Tooltip}>
              </div>
              <${MediaUpload}
                sourceImage=${sourceImage}
                onFileChange=${onFileChange}
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Art Style</label>
                <${Tooltip} text="Select the desired output style. This affects how your edits are applied—some styles work better for certain types of modifications." position="top">
                  <i className="fa-solid fa-circle-question text-slate-500 text-xs cursor-help hover:text-blue-400 transition-colors"></i>
                </${Tooltip}>
              </div>
              <${CustomDropdown} label="" options=${IMAGE_STYLE_OPTIONS} value=${style} onChange=${setStyle} />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Output Aspect Ratio</label>
                <${Tooltip} text="Choose the dimensions for your edited image. The AI will crop or extend the image to match this ratio." position="top">
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

            <div className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Edit Instructions</label>
                <${Tooltip} text="Be specific about what you want changed. Examples: 'Upscale to 4K', 'Add sunset sky', 'Remove background', 'Enhance colors', 'Apply vintage filter'." position="top">
                  <i className="fa-solid fa-circle-question text-slate-500 text-xs cursor-help hover:text-blue-400 transition-colors"></i>
                </${Tooltip}>
              </div>
              <textarea 
                className="w-full px-5 py-4 bg-slate-900 text-white border border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:outline-none placeholder-slate-600 font-bold transition-all text-sm min-h-[120px] resize-none"
                placeholder="Example: 'Upscale this image to 4K resolution while maintaining sharpness and detail. Enhance the colors to make them more vibrant and add a subtle vintage film grain effect.'"
                value=${prompt}
                onChange=${e => setPrompt(e.target.value)}
              ></textarea>
              <p className="text-[9px] text-slate-500 mt-2 ml-1">💡 Tip: Be clear and specific. Describe what to change, not just what you want the final result to look like.</p>
            </div>

            <button 
              disabled=${loading || !sourceImage || !prompt.trim()}
              onClick=${handleEdit}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95"
            >
              ${loading ? html`<i className="fa-solid fa-spinner fa-spin mr-2"></i> Processing your request...` : html`<i className="fa-solid fa-wand-magic-sparkles mr-2"></i> Apply Edits`}
            </button>
          </section>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <${MediaOutput}
            mode="edit"
            loading=${loading}
            statusMessage=${statusMessage}
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

export default ImageEditor;