/**
 * Gemini Research Service
 * Functions for performing research queries and analysis
 */

import { GoogleGenAI } from "@google/genai";
import { getApiKey } from './gemini.shared.js';

/**
 * Perform research query with Google Search integration
 */
export const performResearch = async (query) => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Deep Research: ${query}`,
    config: { tools: [{ googleSearch: {} }] }
  });
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter(chunk => chunk.web)
    ?.map(chunk => ({ title: chunk.web?.title || 'Source', uri: chunk.web?.uri || '' })) || [];
  return { summary: response.text, sources };
};
