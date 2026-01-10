/**
 * SmartTagService
 * Generates intelligent tags from text input and file uploads
 * Uses keyword matching, MIME type mapping, and filename parsing
 */

// Keyword lists for common topics
const TOPIC_KEYWORDS = {
  technology: ['javascript', 'python', 'react', 'node', 'api', 'code', 'programming', 'developer', 'software', 'tech', 'algorithm', 'function', 'variable', 'framework', 'library', 'database', 'sql', 'server', 'client', 'frontend', 'backend', 'devops', 'git', 'docker', 'kubernetes', 'cloud', 'aws', 'azure'],
  business: ['business', 'company', 'startup', 'revenue', 'profit', 'marketing', 'sales', 'customer', 'client', 'product', 'service', 'strategy', 'plan', 'growth', 'market', 'brand', 'logo', 'campaign', 'advertising', 'strategy', 'management', 'leadership', 'team', 'meeting', 'project'],
  content: ['blog', 'article', 'post', 'content', 'writing', 'editor', 'publish', 'draft', 'story', 'narrative', 'copy', 'text', 'word', 'sentence', 'paragraph', 'headline', 'title', 'description', 'meta', 'seo', 'keyword', 'research', 'topic', 'subject'],
  media: ['image', 'photo', 'picture', 'video', 'audio', 'music', 'sound', 'graphic', 'design', 'visual', 'media', 'film', 'movie', 'clip', 'thumbnail', 'screenshot', 'illustration', 'artwork', 'drawing', 'painting', 'gif', 'animation'],
  education: ['learn', 'study', 'course', 'lesson', 'tutorial', 'guide', 'tutorial', 'education', 'school', 'university', 'student', 'teacher', 'learn', 'knowledge', 'skill', 'training', 'workshop', 'seminar', 'lecture', 'assignment', 'homework', 'exam', 'test'],
  health: ['health', 'fitness', 'exercise', 'workout', 'diet', 'nutrition', 'wellness', 'medicine', 'doctor', 'hospital', 'treatment', 'therapy', 'mental', 'physical', 'yoga', 'meditation', 'care'],
  finance: ['money', 'finance', 'bank', 'investment', 'stock', 'trading', 'budget', 'expense', 'income', 'payment', 'transaction', 'account', 'credit', 'debit', 'wallet', 'currency', 'dollar', 'euro', 'crypto', 'bitcoin'],
  research: ['research', 'study', 'analysis', 'data', 'statistics', 'report', 'findings', 'survey', 'experiment', 'hypothesis', 'methodology', 'results', 'conclusion', 'paper', 'thesis', 'dissertation', 'investigation', 'exploration', 'discovery'],
  design: ['design', 'ui', 'ux', 'interface', 'user experience', 'wireframe', 'mockup', 'prototype', 'layout', 'color', 'typography', 'font', 'icon', 'button', 'component', 'style', 'theme', 'responsive', 'mobile', 'desktop'],
  communication: ['email', 'message', 'chat', 'call', 'video call', 'meeting', 'conference', 'presentation', 'slide', 'document', 'letter', 'memo', 'note', 'reminder', 'notification', 'alert']
};

// MIME type to tag mapping
const MIME_TYPE_TAGS = {
  // Images
  'image/jpeg': ['image', 'photo', 'visual', 'media'],
  'image/jpg': ['image', 'photo', 'visual', 'media'],
  'image/png': ['image', 'graphic', 'visual', 'media'],
  'image/gif': ['image', 'animation', 'visual', 'media'],
  'image/webp': ['image', 'visual', 'media'],
  'image/svg+xml': ['image', 'vector', 'graphic', 'design'],
  // Documents
  'application/pdf': ['document', 'pdf', 'file'],
  'application/msword': ['document', 'word', 'text', 'office'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['document', 'word', 'text', 'office'],
  'application/vnd.ms-excel': ['document', 'excel', 'spreadsheet', 'data'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['document', 'excel', 'spreadsheet', 'data'],
  'application/vnd.ms-powerpoint': ['document', 'powerpoint', 'presentation', 'slides'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['document', 'powerpoint', 'presentation', 'slides'],
  // Text
  'text/plain': ['text', 'document', 'file'],
  'text/html': ['html', 'web', 'document'],
  'text/css': ['css', 'style', 'design'],
  'text/javascript': ['javascript', 'code', 'programming', 'technology'],
  'text/json': ['json', 'data', 'code', 'programming'],
  // Audio
  'audio/mpeg': ['audio', 'music', 'sound', 'media'],
  'audio/wav': ['audio', 'sound', 'media'],
  'audio/ogg': ['audio', 'sound', 'media'],
  // Video
  'video/mp4': ['video', 'media', 'visual'],
  'video/mpeg': ['video', 'media', 'visual'],
  'video/quicktime': ['video', 'media', 'visual'],
  'video/x-msvideo': ['video', 'media', 'visual'],
  // Archives
  'application/zip': ['archive', 'compressed', 'file'],
  'application/x-rar-compressed': ['archive', 'compressed', 'file'],
  'application/x-tar': ['archive', 'compressed', 'file']
};

// File extension to tag mapping (fallback)
const EXTENSION_TAGS = {
  '.pdf': ['document', 'pdf'],
  '.doc': ['document', 'word', 'text'],
  '.docx': ['document', 'word', 'text'],
  '.xls': ['document', 'excel', 'spreadsheet', 'data'],
  '.xlsx': ['document', 'excel', 'spreadsheet', 'data'],
  '.ppt': ['document', 'powerpoint', 'presentation'],
  '.pptx': ['document', 'powerpoint', 'presentation'],
  '.txt': ['text', 'document'],
  '.md': ['markdown', 'text', 'document'],
  '.html': ['html', 'web', 'document'],
  '.css': ['css', 'style', 'design'],
  '.js': ['javascript', 'code', 'programming', 'technology'],
  '.jsx': ['javascript', 'react', 'code', 'programming', 'technology'],
  '.ts': ['typescript', 'code', 'programming', 'technology'],
  '.tsx': ['typescript', 'react', 'code', 'programming', 'technology'],
  '.json': ['json', 'data', 'code'],
  '.py': ['python', 'code', 'programming', 'technology'],
  '.java': ['java', 'code', 'programming', 'technology'],
  '.cpp': ['cpp', 'c++', 'code', 'programming', 'technology'],
  '.c': ['c', 'code', 'programming', 'technology'],
  '.jpg': ['image', 'photo', 'visual', 'media'],
  '.jpeg': ['image', 'photo', 'visual', 'media'],
  '.png': ['image', 'graphic', 'visual', 'media'],
  '.gif': ['image', 'animation', 'visual', 'media'],
  '.webp': ['image', 'visual', 'media'],
  '.svg': ['image', 'vector', 'graphic', 'design'],
  '.mp3': ['audio', 'music', 'sound', 'media'],
  '.wav': ['audio', 'sound', 'media'],
  '.mp4': ['video', 'media', 'visual'],
  '.mov': ['video', 'media', 'visual'],
  '.avi': ['video', 'media', 'visual'],
  '.zip': ['archive', 'compressed', 'file'],
  '.rar': ['archive', 'compressed', 'file']
};

/**
 * Normalize text for keyword matching
 */
const normalizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  return text.toLowerCase().trim();
};

/**
 * Extract keywords from text using topic keyword lists
 */
const extractKeywordsFromText = (text) => {
  const normalized = normalizeText(text);
  const detectedTags = new Set();
  
  // Check each topic category
  Object.keys(TOPIC_KEYWORDS).forEach(topic => {
    const keywords = TOPIC_KEYWORDS[topic];
    const found = keywords.some(keyword => normalized.includes(keyword));
    if (found) {
      detectedTags.add(topic);
      // Also add specific matched keywords (limit to top 3 per topic)
      const matched = keywords.filter(kw => normalized.includes(kw)).slice(0, 3);
      matched.forEach(kw => detectedTags.add(kw));
    }
  });
  
  return Array.from(detectedTags);
};

/**
 * Extract tags from filename
 */
const extractTagsFromFilename = (filename) => {
  if (!filename) return [];
  
  const tags = new Set();
  const normalized = normalizeText(filename);
  
  // Check file extension
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  if (EXTENSION_TAGS[ext]) {
    EXTENSION_TAGS[ext].forEach(tag => tags.add(tag));
  }
  
  // Extract keywords from filename (common patterns)
  Object.keys(TOPIC_KEYWORDS).forEach(topic => {
    const keywords = TOPIC_KEYWORDS[topic];
    keywords.forEach(keyword => {
      if (normalized.includes(keyword)) {
        tags.add(topic);
      }
    });
  });
  
  // Common filename patterns
  if (normalized.includes('draft') || normalized.includes('temp') || normalized.includes('backup')) {
    tags.add('draft');
  }
  if (normalized.includes('final') || normalized.includes('completed')) {
    tags.add('final');
  }
  if (normalized.includes('presentation') || normalized.includes('slides')) {
    tags.add('presentation');
  }
  if (normalized.includes('report') || normalized.includes('analysis')) {
    tags.add('report');
  }
  
  return Array.from(tags);
};

/**
 * Categorize file size into tags
 */
const getSizeTags = (sizeInBytes) => {
  const tags = [];
  if (!sizeInBytes) return tags;
  
  const sizeMB = sizeInBytes / (1024 * 1024);
  
  if (sizeMB < 1) {
    tags.push('small');
  } else if (sizeMB < 10) {
    tags.push('medium');
  } else if (sizeMB < 100) {
    tags.push('large');
  } else {
    tags.push('very-large');
  }
  
  return tags;
};

/**
 * Extract text content from file (for text-based files)
 * Returns a promise that resolves with extracted text
 */
const extractTextFromFile = async (file) => {
  if (!file || !(file instanceof File)) return '';
  
  // Only try to extract from text-based files
  if (!file.type.startsWith('text/') && 
      !file.type.includes('json') && 
      !file.type.includes('javascript') &&
      !file.type.includes('css') &&
      !file.type.includes('html')) {
    return '';
  }
  
  try {
    const text = await file.text();
    return text;
  } catch (error) {
    console.warn('Could not extract text from file:', error);
    return '';
  }
};

/**
 * Generate tags from text input
 * @param {string} inputText - The text to analyze
 * @returns {string[]} Array of detected tags
 */
export const generateTagsFromText = (inputText) => {
  if (!inputText || typeof inputText !== 'string' || inputText.trim().length === 0) {
    return [];
  }
  
  const tags = new Set();
  
  // Extract keywords from text
  const keywordTags = extractKeywordsFromText(inputText);
  keywordTags.forEach(tag => tags.add(tag));
  
  // Additional heuristics based on text patterns
  const normalized = normalizeText(inputText);
  
  // Question patterns
  if (normalized.includes('?') || normalized.startsWith('what') || normalized.startsWith('how') || 
      normalized.startsWith('why') || normalized.startsWith('when') || normalized.startsWith('where') ||
      normalized.startsWith('who') || normalized.startsWith('can') || normalized.startsWith('should')) {
    tags.add('question');
  }
  
  // Request patterns
  if (normalized.includes('help') || normalized.includes('please') || normalized.includes('need') ||
      normalized.includes('want') || normalized.includes('could') || normalized.includes('would')) {
    tags.add('request');
  }
  
  // Research patterns
  if (normalized.includes('research') || normalized.includes('find') || normalized.includes('search') ||
      normalized.includes('explore') || normalized.includes('investigate') || normalized.includes('analyze')) {
    tags.add('research');
  }
  
  // Code-related patterns
  if (normalized.includes('code') || normalized.includes('function') || normalized.includes('variable') ||
      normalized.includes('bug') || normalized.includes('error') || normalized.includes('debug')) {
    tags.add('code');
  }
  
  // Limit to top 8 tags to avoid clutter
  const finalTags = Array.from(tags).slice(0, 8);
  
  return finalTags;
};

/**
 * Generate tags from file
 * @param {File} file - The file to analyze
 * @returns {Promise<string[]>} Promise that resolves to array of detected tags
 */
export const generateTagsFromFile = async (file) => {
  if (!file || !(file instanceof File)) {
    return [];
  }
  
  const tags = new Set();
  
  // Get tags from MIME type
  if (file.type && MIME_TYPE_TAGS[file.type]) {
    MIME_TYPE_TAGS[file.type].forEach(tag => tags.add(tag));
  }
  
  // Get tags from filename
  const filenameTags = extractTagsFromFilename(file.name);
  filenameTags.forEach(tag => tags.add(tag));
  
  // Get size-based tags
  const sizeTags = getSizeTags(file.size);
  sizeTags.forEach(tag => tags.add(tag));
  
  // Try to extract text from text-based files and analyze
  try {
    const extractedText = await extractTextFromFile(file);
    if (extractedText && extractedText.length > 0) {
      // Limit text analysis to first 5000 characters for performance
      const textSample = extractedText.substring(0, 5000);
      const textTags = generateTagsFromText(textSample);
      textTags.forEach(tag => tags.add(tag));
    }
  } catch (error) {
    // Silently fail - text extraction is optional
    console.debug('Could not extract text for tag analysis:', error);
  }
  
  // Ensure we have at least basic tags if nothing was detected
  if (tags.size === 0) {
    tags.add('file');
    tags.add('upload');
  }
  
  // Limit to top 8 tags
  const finalTags = Array.from(tags).slice(0, 8);
  
  return finalTags;
};

/**
 * Remove duplicate tags (case-insensitive)
 */
export const deduplicateTags = (tags) => {
  if (!Array.isArray(tags)) return [];
  
  const seen = new Set();
  const unique = [];
  
  tags.forEach(tag => {
    const normalized = normalizeText(tag);
    if (!seen.has(normalized) && tag.trim().length > 0) {
      seen.add(normalized);
      unique.push(tag);
    }
  });
  
  return unique;
};

/**
 * Merge tags from multiple sources and deduplicate
 */
export const mergeTags = (...tagArrays) => {
  const merged = new Set();
  
  tagArrays.forEach(tagArray => {
    if (Array.isArray(tagArray)) {
      tagArray.forEach(tag => {
        if (tag && typeof tag === 'string' && tag.trim().length > 0) {
          merged.add(tag.trim());
        }
      });
    }
  });
  
  return deduplicateTags(Array.from(merged));
};
