/**
 * Gemini Research Service
 * Functions for performing research queries and analysis
 */

import { GoogleGenAI } from "@google/genai";
import { getApiKey } from '../../../../services/ai/gemini.shared.js';
import { trackTokenUsage, estimateTokens } from '../../../../services/tokenTracking.service.js';
import { logGenerationFailure } from '../../../../services/generationFailure.service.js';

const PROVIDER = 'gemini';
const MODEL = 'gemini-3-pro-preview';

/**
 * Perform research query with Google Search integration
 * 
 * @param {string} userId - User ID for tracking
 * @param {string} query - Research query
 * @returns {Promise<Object>} Research results with summary and sources
 */
export const performResearch = async (userId, query) => {
  const startTime = Date.now();
  let tokensUsed = 0;
  
  try {
    tokensUsed = estimateTokens(query) * 5; // Research queries are more token-intensive
    
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `Deep Research: ${query}`,
      config: { tools: [{ googleSearch: {} }] }
    });
    
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter(chunk => chunk.web)
      ?.map(chunk => ({ title: chunk.web?.title || 'Source', uri: chunk.web?.uri || '' })) || [];
    
    const result = { summary: response.text, sources };
    
    // Track token usage
    await trackTokenUsage(userId, tokensUsed, 'research', {
      provider: PROVIDER,
      model: MODEL,
      service: 'research',
      requestDetails: {
        query: query.substring(0, 100),
        sourcesCount: sources.length,
        duration: Date.now() - startTime
      }
    });
    
    return result;
  } catch (error) {
    await logGenerationFailure(userId, 'research', error, {
      provider: PROVIDER,
      model: MODEL,
      tokensUsed,
      inputSnippet: query.substring(0, 500),
      requestDetails: {
        query: query.substring(0, 100),
        duration: Date.now() - startTime,
        tokensUsed
      }
    }).catch(() => {
      // Silently fail - failure logging should not break error propagation
    });
    
    throw error;
  }
};
