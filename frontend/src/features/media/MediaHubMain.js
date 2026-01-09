
import React, { useState, useRef } from 'react';
import htm from 'htm';
import { generateImage, editImage, generateVideo, generateAudio, decodeBase64, decodeAudioData } from '../../services/geminiMediaService.js';
import { transcribeAudio, summarizeVideo } from '../../services/geminiResearchService.js';
import MediaHubHeader from './MediaHubHeader.js';
import MediaHubParameters from './MediaHubParameters.js';
import MediaOutput from './MediaOutput.js';
import MediaPresets from './MediaPresets.js';

const html = htm.bind(React.createElement);

const MediaHubMain = () => {
  const [mode, setMode] = useState('generate'); // generate | edit | video
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Photorealistic');
  const [aspect, setAspect] = useState('16:9');
  const [duration, setDuration] = useState('9s');
  const [withVoice, setWithVoice] = useState(false);
  const [resolution, setResolution] = useState('720p');
  const [resultImage, setResultImage] = useState(null);
  const [resultVideo, setResultVideo] = useState(null);
  const [resultAudio, setResultAudio] = useState(null);
  const [sourceImage, setSourceImage] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef(null);
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

  const handleGenerate = async (templatePrompt = null) => {
    const finalPrompt = templatePrompt ? `${templatePrompt}: ${prompt}` : prompt;
    if (!finalPrompt.trim()) return;
    setLoading(true);
    setResultVideo(null);
    setResultAudio(null);
    try {
      const url = await generateImage(finalPrompt, aspect, style);
      setResultImage(url);
    } catch (e) {
      console.error(e);
      alert("Generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!sourceImage || !prompt.trim()) return;
    setLoading(true);
    setResultVideo(null);
    setResultAudio(null);
    try {
      const url = await editImage(sourceImage, 'image/png', prompt, aspect);
      setResultImage(url);
    } catch (e) {
      console.error(e);
      alert("Editing failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleVideoGenerate = async (templatePrompt = null) => {
    const finalPrompt = templatePrompt ? `${templatePrompt}: ${prompt}` : prompt;
    if (!finalPrompt.trim()) return;

    if (typeof window.aistudio !== 'undefined') {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        alert("Veo video generation requires a paid API key.");
        await window.aistudio.openSelectKey();
      }
    }

    setLoading(true);
    setResultImage(null);
    setResultVideo(null);
    setResultAudio(null);
    setStatusMessage('Nova‑XFinity Engine Initiating Video Synthesis...');
    
    const messages = [
      'Analyzing temporal coherence...',
      'Synthesizing keyframes...',
      'Optimizing for motion fluidness...',
      'Assembling MP4 stream...'
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
        audioPromise = generateAudio(`Welcome to this ${style} presentation about ${finalPrompt.substring(0, 50)}...`);
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
         alert("API Key error. Please re-select your key.");
         if (typeof window.aistudio !== 'undefined') await window.aistudio.openSelectKey();
      } else {
         alert("Synthesis failed.");
      }
    } finally {
      clearInterval(interval);
      setLoading(false);
      setStatusMessage('');
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

  /**
   * Example: Transcribe audio file
   * Demonstrates usage of transcribeAudio function from geminiResearchService
   * 
   * @example
   * // Using File object
   * const transcription = await transcribeAudio(audioFile);
   * 
   * @example
   * // Using base64 string with options
   * const transcription = await transcribeAudio(base64Audio, {
   *   language: "en-US",
   *   model: "gemini"
   * });
   */
  const handleTranscribeAudio = async (audioFile) => {
    if (!audioFile) {
      alert('Please select an audio file to transcribe');
      return;
    }

    setLoading(true);
    setStatusMessage('Transcribing audio...');
    
    try {
      // Example: Basic transcription
      // const result = await transcribeAudio(audioFile);
      
      // Example: Transcription with options
      const result = await transcribeAudio(audioFile, {
        language: 'en-US', // Auto-detected if not provided
        model: 'gemini'
      });
      
      // Result contains: { text, language, confidence, duration, segments }
      console.log('Transcription result:', result);
      alert(`Transcription complete!\n\nText: ${result.text?.substring(0, 200)}...`);
      
      return result;
    } catch (error) {
      console.error('Transcription error:', error);
      alert(`Transcription failed: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  /**
   * Example: Summarize video file
   * Demonstrates usage of summarizeVideo function from geminiResearchService
   * 
   * @example
   * // Using File object
   * const summary = await summarizeVideo(videoFile);
   * 
   * @example
   * // Using base64 string with options
   * const summary = await summarizeVideo(base64Video, {
   *   summaryType: "full",
   *   includeKeyframes: true,
   *   includeTranscript: true,
   *   language: "en"
   * });
   */
  const handleSummarizeVideo = async (videoFile) => {
    if (!videoFile) {
      alert('Please select a video file to summarize');
      return;
    }

    setLoading(true);
    setStatusMessage('Analyzing video content...');
    
    const messages = [
      'Extracting video frames...',
      'Analyzing visual content...',
      'Generating keyframe timestamps...',
      'Creating summary...'
    ];
    
    let msgIndex = 0;
    const interval = setInterval(() => {
      setStatusMessage(messages[msgIndex % messages.length]);
      msgIndex++;
    }, 5000);

    try {
      // Example: Basic video summarization
      // const result = await summarizeVideo(videoFile);
      
      // Example: Video summarization with options
      const result = await summarizeVideo(videoFile, {
        summaryType: 'detailed', // 'brief' | 'detailed' | 'full'
        includeKeyframes: true,
        includeTranscript: false,
        language: 'en'
      });
      
      // Result contains: { summary, keyframes, topics, duration, insights, transcript }
      console.log('Video summary result:', result);
      alert(`Video summary complete!\n\nSummary: ${result.summary?.substring(0, 200)}...\n\nKeyframes: ${result.keyframes?.length || 0}`);
      
      return result;
    } catch (error) {
      console.error('Video summarization error:', error);
      alert(`Video summarization failed: ${error.message}`);
      throw error;
    } finally {
      clearInterval(interval);
      setLoading(false);
      setStatusMessage('');
    }
  };

  const handlePresetClick = (presetPrompt) => {
    if (mode === 'video') {
      handleVideoGenerate(presetPrompt);
    } else {
      handleGenerate(presetPrompt);
    }
  };

  const handleMainGenerate = () => {
    if (mode === 'video') {
      handleVideoGenerate();
    } else if (mode === 'edit') {
      handleEdit();
    } else {
      handleGenerate();
    }
  };

  return html`
    <div className="space-y-12 animate-fadeIn pb-20">
      <${MediaHubHeader} mode=${mode} setMode=${setMode} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-8">
          <${MediaHubParameters}
            mode=${mode}
            style=${style}
            setStyle=${setStyle}
            aspect=${aspect}
            setAspect=${setAspect}
            duration=${duration}
            setDuration=${setDuration}
            withVoice=${withVoice}
            setWithVoice=${setWithVoice}
            sourceImage=${sourceImage}
            onFileChange=${onFileChange}
            prompt=${prompt}
            setPrompt=${setPrompt}
            onGenerate=${handleMainGenerate}
            loading=${loading}
          />

          <${MediaPresets}
            mode=${mode}
            loading=${loading}
            onPresetClick=${handlePresetClick}
          />
        </div>

        <div className="lg:col-span-2 space-y-8">
          <${MediaOutput}
            mode=${mode}
            loading=${loading}
            statusMessage=${statusMessage}
            resultImage=${resultImage}
            resultVideo=${resultVideo}
            resultAudio=${resultAudio}
            provider="GEMINI"
            model="gemini-3-pro-preview"
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

export default MediaHubMain;
