/**
 * Gemini Research Service
 * Frontend service for research analysis, audio transcription, and video summarization
 * 
 * This service handles all research-related AI operations including:
 * - Audio transcription (speech-to-text)
 * - Video summarization and analysis
 * - Research query analysis and structured summaries
 * 
 * @module services/geminiResearchService
 */

import api from './api.js';

/**
 * Convert File object or base64 string to base64 data
 * Utility function to normalize file input formats
 * 
 * @param {File|string} file - File object or base64 string (with or without data URL prefix)
 * @returns {Promise<string>} Base64 encoded string without data URL prefix
 * @private
 */
const normalizeFileToBase64 = async (file) => {
  if (typeof file === 'string') {
    // If it's already a base64 string, extract the data part if it has a data URL prefix
    return file.includes(',') ? file.split(',')[1] : file;
  }
  
  if (file instanceof File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        // Extract base64 data if it includes data URL prefix
        const base64Data = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  
  throw new Error('Invalid file format. Expected File object or base64 string.');
};

/**
 * Transcribe audio file to text
 * 
 * Converts audio files (MP3, WAV, M4A, etc.) to text using Gemini API
 * or compatible speech-to-text providers. Supports both File objects
 * and base64 encoded strings.
 * 
 * @param {File|string} file - Audio file to transcribe (File object or base64 string)
 * @param {Object} options - Optional transcription parameters
 * @param {string} options.language - Language code (e.g., "en-US", "es-ES"). Auto-detected if not provided
 * @param {string} options.model - Transcription model to use (default: "gemini")
 * @returns {Promise<Object>} Transcription result object
 * 
 * @example
 * // Using File object
 * const fileInput = document.querySelector('input[type="file"]');
 * const transcription = await transcribeAudio(fileInput.files[0]);
 * 
 * @example
 * // Using base64 string
 * const base64Audio = "data:audio/mp3;base64,SUQzAwAAAAA...";
 * const transcription = await transcribeAudio(base64Audio, { language: "en-US" });
 * 
 * @example
 * // Returns object with:
 * // {
 * //   text: "Full transcribed text...",
 * //   language: "en-US",
 * //   confidence: 0.95,
 * //   duration: 120.5,
 * //   segments: [
 * //     { start: 0, end: 5, text: "First segment..." },
 * //     { start: 5, end: 10, text: "Second segment..." }
 * //   ]
 * // }
 */
export const transcribeAudio = async (file, options = {}) => {
  try {
    // Input validation
    if (!file) {
      throw new Error('Audio file is required for transcription');
    }

    // Normalize file to base64
    const base64Data = await normalizeFileToBase64(file);
    
    // Determine MIME type
    let mimeType = 'audio/mpeg'; // Default to MP3
    if (file instanceof File) {
      mimeType = file.type || 'audio/mpeg';
    } else if (typeof file === 'string') {
      // Try to extract MIME type from data URL if present
      const dataUrlMatch = file.match(/data:([^;]+);base64/);
      if (dataUrlMatch) {
        mimeType = dataUrlMatch[1];
      }
    }

    const payload = {
      audioData: base64Data,
      mimeType,
      ...options
    };

    const response = await api.post('/api/research/transcribe', payload, {
      timeout: 300000 // 5 minutes timeout for long audio files
    });

    return response.data.data || response.data || {};
  } catch (error) {
    console.error('Error transcribing audio:', error);
    
    // Provide descriptive error messages
    if (error.response?.status === 413) {
      throw new Error('Audio file is too large. Please use a smaller file or compress the audio.');
    } else if (error.response?.status === 415) {
      throw new Error('Unsupported audio format. Please use MP3, WAV, M4A, or OGG format.');
    } else if (error.response?.status === 400) {
      throw new Error(error.response?.data?.error?.message || 'Invalid audio file format or corrupted file.');
    } else if (error.message?.includes('timeout')) {
      throw new Error('Transcription timed out. The audio file may be too long. Please try a shorter file.');
    }
    
    throw new Error(error.response?.data?.error?.message || 'Failed to transcribe audio. Please check your connection and try again.');
  }
};

/**
 * Summarize video content
 * 
 * Analyzes video files and generates summaries, keyframes, and insights.
 * Supports both File objects and base64 encoded strings. The function extracts
 * key information including scene descriptions, topics discussed, and timestamps.
 * 
 * @param {File|string} file - Video file to summarize (File object or base64 string)
 * @param {Object} options - Optional summarization parameters
 * @param {string} options.summaryType - Type of summary: "brief", "detailed", "full" (default: "detailed")
 * @param {boolean} options.includeKeyframes - Include keyframe timestamps (default: true)
 * @param {boolean} options.includeTranscript - Include video transcript if available (default: false)
 * @param {string} options.language - Language for summary (default: "en")
 * @returns {Promise<Object>} Video summary result object
 * 
 * @example
 * // Using File object
 * const fileInput = document.querySelector('input[type="file"]');
 * const summary = await summarizeVideo(fileInput.files[0]);
 * 
 * @example
 * // Using base64 string with options
 * const base64Video = "data:video/mp4;base64,AAAAIGZ0eXBpc29t...";
 * const summary = await summarizeVideo(base64Video, {
 *   summaryType: "full",
 *   includeKeyframes: true,
 *   includeTranscript: true
 * });
 * 
 * @example
 * // Returns object with:
 * // {
 * //   summary: "Video summary text...",
 * //   keyframes: [
 * //     { timestamp: "00:00:15", description: "Introduction scene..." },
 * //     { timestamp: "00:02:30", description: "Main topic discussion..." }
 * //   ],
 * //   topics: ["React Hooks", "State Management", "Best Practices"],
 * //   duration: 300.5,
 * //   insights: {
 * //     mainPoints: [...],
 * //     actionItems: [...],
 * //     keyQuotes: [...]
 * //   },
 * //   transcript: "Full transcript..." // if includeTranscript is true
 * // }
 */
export const summarizeVideo = async (file, options = {}) => {
  try {
    // Input validation
    if (!file) {
      throw new Error('Video file is required for summarization');
    }

    // Normalize file to base64
    const base64Data = await normalizeFileToBase64(file);
    
    // Determine MIME type
    let mimeType = 'video/mp4'; // Default to MP4
    if (file instanceof File) {
      mimeType = file.type || 'video/mp4';
    } else if (typeof file === 'string') {
      // Try to extract MIME type from data URL if present
      const dataUrlMatch = file.match(/data:([^;]+);base64/);
      if (dataUrlMatch) {
        mimeType = dataUrlMatch[1];
      }
    }

    const payload = {
      videoData: base64Data,
      mimeType,
      summaryType: options.summaryType || 'detailed',
      includeKeyframes: options.includeKeyframes !== false,
      includeTranscript: options.includeTranscript || false,
      language: options.language || 'en'
    };

    const response = await api.post('/api/research/summarize-video', payload, {
      timeout: 600000 // 10 minutes timeout for video processing
    });

    return response.data.data || response.data || {};
  } catch (error) {
    console.error('Error summarizing video:', error);
    
    // Provide descriptive error messages
    if (error.response?.status === 413) {
      throw new Error('Video file is too large. Please use a smaller file or compress the video.');
    } else if (error.response?.status === 415) {
      throw new Error('Unsupported video format. Please use MP4, WebM, or MOV format.');
    } else if (error.response?.status === 400) {
      throw new Error(error.response?.data?.error?.message || 'Invalid video file format or corrupted file.');
    } else if (error.message?.includes('timeout')) {
      throw new Error('Video summarization timed out. The video file may be too long. Please try a shorter video.');
    }
    
    throw new Error(error.response?.data?.error?.message || 'Failed to summarize video. Please check your connection and try again.');
  }
};

/**
 * Perform research analysis
 * 
 * Analyzes a research query or topic and returns structured research summaries
 * with citations, key findings, and related information. Uses Gemini's search
 * grounding capabilities to provide real-time, accurate research results.
 * 
 * @param {string} query - Research query or topic to analyze
 * @param {Object} options - Optional research parameters
 * @param {string} options.focus - Focus area: "statistics", "trends", "news", "analysis", "all" (default: "all")
 * @param {number} options.maxResults - Maximum number of sources to include (default: 10)
 * @param {string} options.language - Language for research results (default: "en")
 * @param {string} options.timeRange - Time range: "day", "week", "month", "year", "all" (default: "all")
 * @returns {Promise<Object>} Research analysis result object
 * 
 * @example
 * // Basic research query
 * const research = await performResearch("React Hooks best practices 2024");
 * 
 * @example
 * // Research with options
 * const research = await performResearch(
 *   "AI content generation trends",
 *   {
 *     focus: "trends",
 *     maxResults: 15,
 *     timeRange: "month"
 *   }
 * );
 * 
 * @example
 * // Returns object with:
 * // {
 * //   summary: "Comprehensive research summary...",
 * //   sources: [
 * //     {
 * //       title: "Source Title",
 * //       uri: "https://example.com/article",
 * //       snippet: "Relevant excerpt...",
 * //       relevance: 0.95
 * //     }
 * //   ],
 * //   keyFindings: [
 * //     "Finding 1...",
 * //     "Finding 2..."
 * //   ],
 * //   statistics: {...},
 * //   trends: [...],
 * //   citations: [...],
 * //   timestamp: "2024-01-15T10:30:00Z"
 * // }
 */
export const performResearch = async (query, options = {}) => {
  try {
    // Input validation
    if (!query || typeof query !== 'string' || !query.trim()) {
      throw new Error('Research query is required and must be a non-empty string');
    }

    const payload = {
      query: query.trim(),
      focus: options.focus || 'all',
      maxResults: options.maxResults || 10,
      language: options.language || 'en',
      timeRange: options.timeRange || 'all'
    };

    const response = await api.post('/api/research/query', payload, {
      timeout: 120000 // 2 minutes timeout for research queries
    });

    return response.data.data || response.data || {};
  } catch (error) {
    console.error('Error performing research:', error);
    
    // Provide descriptive error messages
    if (error.response?.status === 400) {
      throw new Error(error.response?.data?.error?.message || 'Invalid research query. Please provide a valid search term or question.');
    } else if (error.response?.status === 429) {
      throw new Error('Research quota exceeded. Please upgrade your plan or try again later.');
    } else if (error.message?.includes('timeout')) {
      throw new Error('Research query timed out. Please try a more specific query or try again later.');
    } else if (error.response?.status === 503) {
      throw new Error('Research service is temporarily unavailable. Please try again in a few moments.');
    }
    
    throw new Error(error.response?.data?.error?.message || 'Failed to perform research. Please check your connection and try again.');
  }
};
