
import React, { useRef } from 'react';
import htm from 'htm';
import { decodeBase64, decodeAudioData } from '@/services/geminiMediaService.js';

const html = htm.bind(React.createElement);

const AudioBlock = ({ audioUrl }) => {
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

  if (!audioUrl) return null;

  return html`
    <button onClick=${() => playTTS(audioUrl)} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center shadow-lg">
      <i className="fa-solid fa-volume-high mr-2 text-blue-400"></i> Play Voiceover
    </button>
  `;
};

export default AudioBlock;
