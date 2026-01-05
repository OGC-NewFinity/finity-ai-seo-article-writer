
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTIONS } from "../constants.js";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const cleanAIOutput = (text) => {
  if (!text) return "";
  // More aggressive cleanup for unwanted markers
  let cleaned = text.replace(/```(?:html|markdown|xml)?\n?([\s\S]*?)\n?```/gi, '$1');
  cleaned = cleaned.replace(/^Sure,? here is the section:?\n?/gi, '');
  cleaned = cleaned.replace(/^#+ .*\n/gi, ''); // Remove leading H1 if mistakenly added
  return cleaned.trim();
};

export const generateMetadata = async (topic, keywords, articleType, language, articleSize, pov) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `POST CONTEXT:
Topic: "${topic}"
Keywords: "${keywords.join(', ')}"
Article Type: "${articleType}"
Language Target: "${language}"
Word Count Target: "${articleSize}"
Narrative POV: "${pov}"

Generate standard WordPress SEO metadata including a slug and optimized focus keyphrase.`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTIONS,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          focusKeyphrase: { type: Type.STRING },
          seoTitle: { type: Type.STRING },
          slug: { type: Type.STRING },
          metaDescription: { type: Type.STRING }
        },
        required: ['focusKeyphrase', 'seoTitle', 'slug', 'metaDescription']
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const generateOutline = async (topic, keywords, articleType, language, articleSize, pov) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on the topic "${topic}" and article type "${articleType}", create an SEO-optimized outline for a "${articleSize}" post in "${language}". Point of View: "${pov}". Use keywords: ${keywords.join(', ')}. Return a JSON array of section headings.`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTIONS,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const generateSection = async (sectionTitle, topic, keywords, tone, articleType, language, articleSize, pov, imageQuantity) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Write the content block for the heading "${sectionTitle}".
Context: This is part of a "${articleType}" post about "${topic}".
Total Requested Images for whole article: ${imageQuantity}.
Constraint Check:
- Narrative POV: Strictly use ${pov}.
- Spelling/Regionality: Use regional rules for ${language}.
- Style: ${tone} tone, >90% active voice, <20 words/sentence.
- Keywords to weave in: ${keywords.join(', ')}.
- Word Target: Size is "${articleSize}". Adjust section depth accordingly.
- Media: If appropriate for this section, insert [IMAGE_PLACEHOLDER] with detailed technical prompt as specified in the system instructions.

OUTPUT ONLY RAW HTML TAGS.`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTIONS,
    }
  });
  
  return cleanAIOutput(response.text || '');
};

export const performResearch = async (query) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Perform real-time web research on: ${query}. Focus on recent data, statistics, and trends. Summarize with citations.`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter(chunk => chunk.web)
    ?.map(chunk => ({
      title: chunk.web?.title || 'External Source',
      uri: chunk.web?.uri || ''
    })) || [];

  return {
    summary: response.text,
    sources
  };
};

export const analyzeSEO = async (content, keywords) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Audit the following HTML content against Yoast SEO standards for keywords: ${keywords.join(', ')}. Check POV consistency, active voice density, transition usage, and sentence length.`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTIONS,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          readability: { type: Type.STRING },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['score', 'readability', 'suggestions']
      }
    }
  });
  return JSON.parse(response.text || '{}');
};
