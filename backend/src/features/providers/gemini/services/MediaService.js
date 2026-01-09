/**
 * Gemini Media Service
 * Handles prompt-to-image generation, video prompt composition, and editing prompts
 * 
 * This service provides functions for:
 * - Image generation from prompts
 * - Image editing and modification
 * - Video generation from prompts
 * - Video prompt composition
 * - Audio/TTS generation
 * - Media data encoding/decoding utilities
 */

import { GoogleGenAI, Modality } from "@google/genai";
import { getApiKey } from '../../../../services/ai/gemini.shared.js';
import { trackTokenUsage, estimateImageTokens, estimateVideoTokens } from '../../../../services/tokenTracking.service.js';
import { logGenerationFailure } from '../../../../services/generationFailure.service.js';

const PROVIDER = 'gemini';
const IMAGE_MODEL = 'gemini-2.5-flash-image';
const VIDEO_MODEL = 'veo-3.1-fast-generate-preview';
const AUDIO_MODEL = 'gemini-2.5-flash-preview-tts';

/**
 * Generate image from prompt
 * 
 * @param {string} userId - User ID for tracking
 * @param {string} prompt - Image generation prompt
 * @param {string} aspectRatio - Image aspect ratio (default: "16:9")
 * @param {string} style - Image style (default: "Photorealistic")
 * @returns {Promise<string|null>} Base64-encoded image data URL or null if generation fails
 */
export const generateImage = async (userId, prompt, aspectRatio = "16:9", style = "Photorealistic") => {
  const startTime = Date.now();
  let tokensUsed = 0;
  
  try {
    tokensUsed = estimateImageTokens(prompt, aspectRatio);
    
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: { parts: [{ text: `Professional asset. Style: ${style}. Subject: ${prompt}.` }] },
      config: { imageConfig: { aspectRatio } },
    });
    
    let imageData = null;
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        imageData = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }
    
    if (!imageData) {
      throw new Error('Image generation failed - no image data returned');
    }
    
    // Track token usage
    await trackTokenUsage(userId, tokensUsed, 'image_generation', {
      provider: PROVIDER,
      model: IMAGE_MODEL,
      service: 'image_generation',
      requestDetails: {
        prompt: prompt?.substring(0, 100),
        style,
        aspectRatio,
        duration: Date.now() - startTime
      }
    });
    
    return imageData;
  } catch (error) {
    await logGenerationFailure(userId, 'image_generation', error, {
      provider: PROVIDER,
      model: IMAGE_MODEL,
      tokensUsed,
      inputSnippet: prompt?.substring(0, 500),
      requestDetails: {
        prompt: prompt?.substring(0, 100),
        style,
        aspectRatio,
        duration: Date.now() - startTime,
        tokensUsed
      }
    }).catch(() => {
      // Silently fail - failure logging should not break error propagation
    });
    
    throw error;
  }
};

/**
 * Edit existing image with a prompt
 * 
 * @param {string} userId - User ID for tracking
 * @param {string} base64ImageData - Base64-encoded image data (with or without data URL prefix)
 * @param {string} mimeType - MIME type of the image (e.g., "image/png", "image/jpeg")
 * @param {string} prompt - Editing prompt describing desired modifications
 * @param {string} aspectRatio - Image aspect ratio (default: "16:9")
 * @returns {Promise<string|null>} Base64-encoded edited image data URL or null if editing fails
 */
export const editImage = async (userId, base64ImageData, mimeType, prompt, aspectRatio = "16:9") => {
  const startTime = Date.now();
  let tokensUsed = 0;
  
  try {
    tokensUsed = estimateImageTokens(prompt, aspectRatio);
    
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
    // Extract base64 data if it includes data URL prefix
    const imageData = base64ImageData.split(',')[1] || base64ImageData;
    
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [
          { inlineData: { data: imageData, mimeType } },
          { text: `Modify the provided image: "${prompt}".` }
        ]
      },
      config: { imageConfig: { aspectRatio } }
    });
    
    let editedImageData = null;
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        editedImageData = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }
    
    if (!editedImageData) {
      throw new Error('Image editing failed - no image data returned');
    }
    
    // Track token usage
    await trackTokenUsage(userId, tokensUsed, 'image_editing', {
      provider: PROVIDER,
      model: IMAGE_MODEL,
      service: 'image_editing',
      requestDetails: {
        prompt: prompt?.substring(0, 100),
        aspectRatio,
        duration: Date.now() - startTime
      }
    });
    
    return editedImageData;
  } catch (error) {
    await logGenerationFailure(userId, 'image_editing', error, {
      provider: PROVIDER,
      model: IMAGE_MODEL,
      tokensUsed,
      inputSnippet: prompt?.substring(0, 500),
      requestDetails: {
        prompt: prompt?.substring(0, 100),
        aspectRatio,
        duration: Date.now() - startTime,
        tokensUsed
      }
    }).catch(() => {
      // Silently fail - failure logging should not break error propagation
    });
    
    throw error;
  }
};

/**
 * Compose a video generation prompt from description
 * 
 * @param {string} description - Video description or concept
 * @param {string} style - Video style (e.g., "Cinematic", "Documentary", "Animated")
 * @param {string} mood - Desired mood (e.g., "Energetic", "Calm", "Dramatic")
 * @returns {string} Composed video generation prompt
 */
export const composeVideoPrompt = (description, style = "Cinematic", mood = "Professional") => {
  return `Visual Style: ${style}. Mood: ${mood}. ${description}. Create a compelling video that visually represents this concept.`;
};

/**
 * Generate video from prompt
 * 
 * @param {string} userId - User ID for tracking
 * @param {string} prompt - Video generation prompt
 * @param {string} style - Video style (default: "Cinematic")
 * @param {string} resolution - Video resolution: "720p" or "1080p" (default: "720p")
 * @param {string} aspectRatio - Video aspect ratio: "16:9" or "9:16" (default: "16:9")
 * @param {string} duration - Video duration (default: "9s")
 * @param {string|null} startFrameBase64 - Optional base64-encoded start frame image (with or without data URL prefix)
 * @returns {Promise<string>} Video download URL with API key parameter
 */
export const generateVideo = async (
  userId,
  prompt,
  style = 'Cinematic',
  resolution = '720p',
  aspectRatio = '16:9',
  duration = '9s',
  startFrameBase64 = null
) => {
  const startTime = Date.now();
  let tokensUsed = 0;
  
  try {
    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });
    
    // Compose enhanced prompt
    const composedPrompt = composeVideoPrompt(prompt, style);
    
    tokensUsed = estimateVideoTokens(composedPrompt, duration);
    
    const requestConfig = {
      model: VIDEO_MODEL,
      prompt: `${composedPrompt}. Duration: ${duration}.`,
      config: { 
        numberOfVideos: 1, 
        resolution: resolution === '720p' || resolution === '1080p' ? resolution : '720p', 
        aspectRatio: aspectRatio === '16:9' || aspectRatio === '9:16' ? aspectRatio : '16:9'
      }
    };
    
    // Add start frame if provided
    if (startFrameBase64) {
      const frameData = startFrameBase64.split(',')[1] || startFrameBase64;
      requestConfig.image = { 
        imageBytes: frameData, 
        mimeType: 'image/png' 
      };
    }
    
    // Start video generation operation
    let operation = await ai.models.generateVideos(requestConfig);
    
    // Poll for completion
    while (!operation.done) {
      await new Promise(r => setTimeout(r, 10000)); // Wait 10 seconds between polls
      operation = await ai.operations.getVideosOperation({ operation });
      
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
    const videoUrl = `${downloadLink}${separator}key=${apiKey}`;
    
    // Track token usage
    await trackTokenUsage(userId, tokensUsed, 'video_generation', {
      provider: PROVIDER,
      model: VIDEO_MODEL,
      service: 'video_generation',
      requestDetails: {
        prompt: prompt?.substring(0, 100),
        style,
        aspectRatio,
        duration,
        resolution,
        durationMs: Date.now() - startTime
      }
    });
    
    return videoUrl;
  } catch (error) {
    await logGenerationFailure(userId, 'video_generation', error, {
      provider: PROVIDER,
      model: VIDEO_MODEL,
      tokensUsed,
      inputSnippet: prompt?.substring(0, 500),
      requestDetails: {
        prompt: prompt?.substring(0, 100),
        style,
        aspectRatio,
        duration,
        durationMs: Date.now() - startTime,
        tokensUsed
      }
    }).catch(() => {
      // Silently fail - failure logging should not break error propagation
    });
    
    throw error;
  }
};

/**
 * Compose an image editing prompt from description
 * 
 * @param {string} description - Description of desired edits
 * @param {string} operation - Type of operation (e.g., "modify", "enhance", "remove", "add")
 * @returns {string} Composed editing prompt
 */
export const composeEditingPrompt = (description, operation = "modify") => {
  const operationMap = {
    modify: "Modify the image to",
    enhance: "Enhance the image by",
    remove: "Remove from the image",
    add: "Add to the image"
  };
  
  const operationText = operationMap[operation] || "Modify the image to";
  return `${operationText}: ${description}`;
};

/**
 * Generate audio from text (Text-to-Speech)
 * 
 * @param {string} userId - User ID for tracking
 * @param {string} text - Text to convert to speech
 * @param {string} voice - Voice name (default: "Kore")
 * @returns {Promise<string|null>} Base64-encoded audio data URL or null if generation fails
 */
export const generateAudio = async (userId, text, voice = 'Kore') => {
  const startTime = Date.now();
  let tokensUsed = 0;
  
  try {
    tokensUsed = Math.ceil(text.length / 4); // Estimate tokens for TTS
    
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
      model: AUDIO_MODEL,
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
    if (!base64Audio) {
      throw new Error('Audio generation failed - no audio data returned');
    }
    
    const audioData = `data:audio/pcm;base64,${base64Audio}`;
    
    // Track token usage
    await trackTokenUsage(userId, tokensUsed, 'audio_generation', {
      provider: PROVIDER,
      model: AUDIO_MODEL,
      service: 'audio_generation',
      requestDetails: {
        textLength: text.length,
        voice,
        duration: Date.now() - startTime
      }
    });
    
    return audioData;
  } catch (error) {
    await logGenerationFailure(userId, 'audio_generation', error, {
      provider: PROVIDER,
      model: AUDIO_MODEL,
      tokensUsed,
      inputSnippet: text.substring(0, 500),
      requestDetails: {
        textLength: text.length,
        voice,
        duration: Date.now() - startTime,
        tokensUsed
      }
    }).catch(() => {
      // Silently fail - failure logging should not break error propagation
    });
    
    throw error;
  }
};

/**
 * Decode base64 string to bytes
 * Utility function for converting base64 encoded data to Uint8Array
 * 
 * @param {string} base64 - Base64 encoded string
 * @returns {Uint8Array} Decoded bytes array
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
 * Converts raw audio bytes to Web Audio API AudioBuffer for playback
 * 
 * @param {Uint8Array} data - Raw audio data bytes
 * @param {AudioContext} ctx - Web Audio API AudioContext
 * @param {number} sampleRate - Audio sample rate (default: 24000)
 * @param {number} numChannels - Number of audio channels (default: 1)
 * @returns {Promise<AudioBuffer>} Decoded AudioBuffer
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
