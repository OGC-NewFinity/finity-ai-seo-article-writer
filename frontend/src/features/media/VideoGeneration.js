import React, { useState, useRef } from 'react';
import htm from 'htm';
import { generateVideo, generateAudio, decodeBase64, decodeAudioData } from '../../services/geminiMediaService.js';
import CustomDropdown from '../../../../components/common/CustomDropdown.js';
import { VIDEO_ASPECT_RATIO_OPTIONS, IMAGE_STYLE_OPTIONS } from '../../../../constants.js';
import { VIDEO_DURATION_OPTIONS } from '../../../../constants.js';
import MediaUpload from './MediaUpload.js';
import VideoEditor from './VideoEditor.js';
import MediaOutput from './MediaOutput.js';
import MediaPresets from './MediaPresets.js';
import AudioBlock from './AudioBlock.js';
import OnboardingBanner from '../../../../components/common/OnboardingBanner.js';
import Tooltip from '../../../../components/common/Tooltip.js';
import { showError } from '../../utils/errorHandler.js';

const html = htm.bind(React.createElement);

const VideoGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Cinematic');
  const [aspect, setAspect] = useState('16:9');
  const [duration, setDuration] = useState('9s');
  const [withVoice, setWithVoice] = useState(false);
  const [resolution, setResolution] = useState('720p');
  const [resultVideo, setResultVideo] = useState(null);
  const [resultAudio, setResultAudio] = useState(null);
  const [sourceImage, setSourceImage] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const audioContextRef = useRef(null);

  const playTTS = async (base64Audio) => {
    if (!base64Audio) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;
      const data = decodeBase64(base64Audio.split(',')[1]);
      const buffer = await decodeAudioData(data, ctx, 24000, 1);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
    } catch (e) {
      console.error("Audio playback error", e);
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSourceImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoGenerate = async (templatePrompt = null) => {
    const finalPrompt = templatePrompt ? `${templatePrompt}: ${prompt}` : prompt;
    if (!finalPrompt.trim()) return;

    if (typeof window.aistudio !== 'undefined') {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        showError('Video generation requires a valid paid API key. Go to Settings to configure your API key.', 'API_KEY_MISSING');
        await window.aistudio.openSelectKey();
        return;
      }
    }

    setLoading(true);
    setResultVideo(null);
    setResultAudio(null);
    setStatusMessage('Nova‑XFinity Engine Initiating Video Synthesis...');
    
    const messages = [
      'Nova‑XFinity Engine analyzing temporal coherence...',
      'Synthesizing keyframes with AI precision...',
      'Optimizing motion fluidness and transitions...',
      'Assembling final video stream...'
    ];
    
    let msgIndex = 0;
    const interval = setInterval(() => {
      setStatusMessage(messages[msgIndex % messages.length]);
      msgIndex++;
    }, 12000);

    try {
      // Parallel generation if voice is enabled
      const videoPromise = generateVideo(finalPrompt, style, resolution, aspect, duration, sourceImage);
      let audioPromise = null;
      
      if (withVoice) {
        audioPromise = generateAudio(`Welcome to this ${style.toLowerCase()} presentation about ${finalPrompt.substring(0, 50)}...`);
      }

      const [videoUrl, audioUrl] = await Promise.all([videoPromise, audioPromise]);
      
      setResultVideo(videoUrl);
      if (audioUrl) {
        setResultAudio(audioUrl);
        // Auto-play introduction
        playTTS(audioUrl);
      }
    } catch (e) {
      console.error(e);
      if (e.message?.includes("Requested entity was not found.")) {
         showError(e, 'API_KEY_INVALID');
         if (typeof window.aistudio !== 'undefined') await window.aistudio.openSelectKey();
      } else {
         showError(e, 'VIDEO_GENERATION_FAILED');
      }
    } finally {
      clearInterval(interval);
      setLoading(false);
      setStatusMessage('');
    }
  };

  const handlePresetClick = (presetPrompt) => {
    handleVideoGenerate(presetPrompt);
  };

  return html`
    <div className="space-y-12 animate-fadeIn pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Video Generation</h2>
          <p className="text-slate-400 mt-2 font-medium">Create professional videos from prompts using Veo 3.1 and the Nova‑XFinity Engine powered by Gemini Multimodal AI.</p>
        </div>
      </header>

      <${OnboardingBanner}
        id="video-generation-welcome"
        title="Welcome to Video Generation!"
        message="Describe your video vision with details about motion, scenes, camera angles, and mood. Optionally add a starting image and enable AI voiceover for complete productions."
        icon="fa-clapperboard"
        type="info"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-8">
          <section className="bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-800 space-y-6">
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest mb-4 flex items-center">
              <i className="fa-solid fa-sliders text-blue-600 mr-2"></i> Video Settings
            </h3>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Visual Style</label>
                <${Tooltip} text="Choose the visual aesthetic for your video. Cinematic offers film-like quality, Photorealistic creates lifelike scenes, and Artistic provides creative variations." position="top">
                  <i className="fa-solid fa-circle-question text-slate-500 text-xs cursor-help hover:text-blue-400 transition-colors"></i>
                </${Tooltip}>
              </div>
              <${CustomDropdown} label="" options=${IMAGE_STYLE_OPTIONS} value=${style} onChange=${setStyle} />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Aspect Ratio</label>
                <${Tooltip} text="Select video dimensions. 16:9 for widescreen, 9:16 for vertical/social media, 1:1 for square formats." position="top">
                  <i className="fa-solid fa-circle-question text-slate-500 text-xs cursor-help hover:text-blue-400 transition-colors"></i>
                </${Tooltip}>
              </div>
              <${CustomDropdown} 
                label="" 
                options=${VIDEO_ASPECT_RATIO_OPTIONS} 
                value=${aspect} 
                onChange=${setAspect} 
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Resolution</label>
                <${Tooltip} text="720p is faster and uses less resources. 1080p offers higher quality but takes longer to generate." position="top">
                  <i className="fa-solid fa-circle-question text-slate-500 text-xs cursor-help hover:text-blue-400 transition-colors"></i>
                </${Tooltip}>
              </div>
              <div className="grid grid-cols-2 gap-2">
                ${['720p', '1080p'].map(r => html`
                  <button 
                    key=${r}
                    onClick=${() => setResolution(r)}
                    className=${`py-2 rounded-xl text-[10px] font-black border transition-all ${resolution === r ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-700'}`}
                  >
                    ${r}
                  </button>
                `)}
              </div>
            </div>

            <${VideoEditor}
              duration=${duration}
              setDuration=${setDuration}
              withVoice=${withVoice}
              setWithVoice=${setWithVoice}
            />

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Starting Frame (Optional)</label>
                <${Tooltip} text="Upload an image to start your video from that frame. This helps maintain visual consistency and gives the AI a reference point." position="top">
                  <i className="fa-solid fa-circle-question text-slate-500 text-xs cursor-help hover:text-blue-400 transition-colors"></i>
                </${Tooltip}>
              </div>
              <${MediaUpload}
                sourceImage=${sourceImage}
                onFileChange=${onFileChange}
              />
            </div>

            <div className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Video Prompt</label>
                <${Tooltip} text="Describe your video in detail. Include scene descriptions, motion, camera movements, lighting, mood, transitions, and key visual elements." position="top">
                  <i className="fa-solid fa-circle-question text-slate-500 text-xs cursor-help hover:text-blue-400 transition-colors"></i>
                </${Tooltip}>
              </div>
              <textarea 
                className="w-full px-5 py-4 bg-slate-900 text-white border border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:outline-none placeholder-slate-600 font-bold transition-all text-sm min-h-[120px] resize-none"
                placeholder="Example: 'A serene drone shot slowly moving over a mountain range at sunrise. Soft golden light gradually illuminates snow-capped peaks. Smooth camera pan from left to right, cinematic wide angle, peaceful atmosphere, natural colors'"
                value=${prompt}
                onChange=${e => setPrompt(e.target.value)}
              ></textarea>
              <p className="text-[9px] text-slate-500 mt-2 ml-1">💡 Tip: Describe camera movements, scene transitions, and temporal elements. Be specific about motion and pacing.</p>
            </div>

            <button 
              disabled=${loading || !prompt.trim()}
              onClick=${() => handleVideoGenerate()}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95"
            >
              ${loading ? html`<i className="fa-solid fa-spinner fa-spin mr-2"></i> Processing your request...` : html`<i className="fa-solid fa-clapperboard mr-2"></i> Generate Video`}
            </button>
          </section>

          <${MediaPresets}
            mode="video"
            loading=${loading}
            onPresetClick=${handlePresetClick}
          />
        </div>

        <div className="lg:col-span-2 space-y-8">
          <${MediaOutput}
            mode="video"
            loading=${loading}
            statusMessage=${statusMessage}
            resultImage=${null}
            resultVideo=${resultVideo}
            resultAudio=${resultAudio}
            provider="GEMINI"
            model="veo-3.1"
            prompt=${prompt}
            style=${style}
            aspect=${aspect}
            duration=${duration}
            resolution=${resolution}
          />
        </div>
      </div>
    </div>
  `;
};

export default VideoGeneration;