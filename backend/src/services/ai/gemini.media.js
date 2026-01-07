/**
 * Gemini Media Generation Service
 * Functions for generating images, videos, audio, and related utilities
 */

import { GoogleGenAI, Modality } from "@google/genai";
import { getApiKey } from './gemini.shared.js';

/**
 * Generate image from prompt
 */
export const generateImage = async (prompt, aspectRatio = "16:9", style = "Photorealistic") => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: `Professional asset. Style: ${style}. Subject: ${prompt}.` }] },
    config: { imageConfig: { aspectRatio } },
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return null;
};

/**
 * Edit existing image
 */
export const editImage = async (base64ImageData, mimeType, prompt, aspectRatio = "16:9") => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64ImageData.split(',')[1] || base64ImageData, mimeType } },
        { text: `Modify the provided image: "${prompt}".` }
      ]
    },
    config: { imageConfig: { aspectRatio } }
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return null;
};

/**
 * Generate video from prompt
 */
export const generateVideo = async (prompt, style = 'Cinematic', resolution = '720p', aspectRatio = '16:9', duration = '9s', startFrameBase64 = null) => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  
  const requestConfig = {
    model: 'veo-3.1-fast-generate-preview',
    prompt: `Visual Style: ${style}. Duration: ${duration}. ${prompt}`,
    config: { 
      numberOfVideos: 1, 
      resolution: resolution === '720p' || resolution === '1080p' ? resolution : '720p', 
      aspectRatio: aspectRatio === '16:9' || aspectRatio === '9:16' ? aspectRatio : '16:9'
    }
  };
  
  if (startFrameBase64) {
    requestConfig.image = { 
      imageBytes: startFrameBase64.split(',')[1] || startFrameBase64, 
      mimeType: 'image/png' 
    };
  }
  
  let operation = await ai.models.generateVideos(requestConfig);
  
  while (!operation.done) {
    await new Promise(r => setTimeout(r, 10000));
    operation = await ai.operations.getVideosOperation({operation});
    
    // Check for operation error
    if (operation.error) {
      throw new Error(`Video Generation Operation Failed: ${operation.error.message || 'Unknown Error'}`);
    }
  }

  const videoMeta = operation.response?.generatedVideos?.[0]?.video;
  if (!videoMeta || !videoMeta.uri) {
    throw new Error("Video generation completed but no URI was returned.");
  }

  const downloadLink = videoMeta.uri;
  // Ensure the URL parameter joining is correct
  const separator = downloadLink.includes('?') ? '&' : '?';
  return `${downloadLink}${separator}key=${apiKey}`;
};

/**
 * Generate audio from text (TTS)
 */
export const generateAudio = async (text, voice = 'Kore') => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say with a professional marketing tone: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
      },
    },
  });
  
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) return null;
  
  return `data:audio/pcm;base64,${base64Audio}`;
};

/**
 * Decode base64 string to bytes
 */
export function decodeBase64(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decode audio data to AudioBuffer
 */
export async function decodeAudioData(data, ctx, sampleRate = 24000, numChannels = 1) {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
