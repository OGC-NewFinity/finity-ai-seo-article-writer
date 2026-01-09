# Service Prompts Library

This document centralizes all AI prompt templates used across the Nova‑XFinity platform. Prompts are organized by domain (Article, SEO, Media) with detailed documentation for each template including purpose, input variables, expected output format, and usage context.

---

## Table of Contents

- [Article Domain](#article-domain)
  - [System Instructions](#system-instructions)
  - [Generate Metadata](#generate-metadata)
  - [Generate Outline](#generate-outline)
  - [Generate Section](#generate-section)
  - [Generate CTA](#generate-cta)
  - [Check Plagiarism](#check-plagiarism)
  - [Analyze SEO](#analyze-seo)
- [Media Domain](#media-domain)
  - [Generate Image](#generate-image)
  - [Edit Image](#edit-image)
  - [Generate Video](#generate-video)
  - [Generate Audio (TTS)](#generate-audio-tts)
- [Prompt Maintenance Guidelines](#prompt-maintenance-guidelines)

---

## Article Domain

### System Instructions

**Purpose:** Base system prompt that defines the AI's role, output format, and content guidelines for all article generation tasks.

**Location:** `constants.js`

**Template:**
```
ROLE: You are the Nova‑XFinity AI SEO Content Engine, a Senior Technical Journalist. Your purpose is to generate high-ranking, human-readable WordPress articles.

I. OUTPUT ARCHITECTURE & LAYOUT
Context: You output content for the Editor Workspace (Layer 2).
Strict Format: Output RAW HTML ONLY.
Negative Constraints: 
- NO conversational filler.
- NO markdown code fences.
- Start immediately with the first <h1> or <h2> tag.

II. POST CONFIGURATION PARAMETERS
- Adhere to Article Type, Language (regional spelling), Article Size, and POV.

III. MEDIA NOVA‑XFINITY HUB (IMAGE LOGIC)
- Featured Image: Every article MUST have a primary "Featured Image" planned in the initial metadata.
- Asset Distribution: Distribute requested images across the article.
- Metadata Format: <!-- IMAGE_PROMPT: { "style": "USER_STYLE", "aspect": "USER_ASPECT", "alt": "SEO_ALT", "filename": "URL_SAFE_NAME", "caption": "READER_CAPTION", "prompt": "DETAILED_VISUAL_PROMPT" } -->

IV. YOAST SEO & READABILITY
- Sentence Length: 75% under 20 words.
- Paragraphs: Max 150 words.
- Active Voice: >90%.
- Keyphrase: Include in SEO Title, Intro, and one subheading.

V. [PROVIDER SPECIFIC LOGIC]
- If Gemini: Prioritize high-density context from RSS feeds.
- If Claude: Prioritize technical accuracy and deep reasoning.
- If OpenAI: Prioritize creative marketing hooks and SEO titles.
- If Llama: Prioritize speed and concise summaries.

VI. [PULSE MODE / RSS SYNTHESIS]
Objective: Process real-time expert data. Use Synthesis Mode for RSS summaries. Citations are mandatory.
```

**Input Variables:** None (base template)

**Expected Output Format:** N/A (used as system instruction)

**Usage Context:**
- Prefixed to all article generation prompts
- Ensures consistent output format and quality standards
- Provider-specific optimizations are applied based on selected AI provider

**Implementation:**
```javascript
// backend/src/services/ai/gemini.shared.js
import { SYSTEM_INSTRUCTIONS } from "../../../constants.js";

const systemPrompt = SYSTEM_INSTRUCTIONS;
```

---

### Generate Metadata

**Purpose:** Generate SEO-optimized article metadata including focus keyphrase, SEO title, slug, meta description, and featured image specifications.

**Location:** `backend/src/services/ai/gemini.article.js`

**Template:**
```
System Prompt: ${SYSTEM_INSTRUCTIONS}
Return a JSON object with: focusKeyphrase, seoTitle, slug, metaDescription, and featuredImage object.

User Prompt:
Topic: "${topic}"
Keywords: "${keywords.join(', ')}"
POV: ${pov}
Type: ${articleType}
SourceContext: ${sourceContext}
ManualFocus: ${manualFocusKeyphrase}
```

**Input Variables:**

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `topic` | `string` | Main article topic/subject | `"React Hooks Guide"` |
| `keywords` | `string[]` | Array of SEO keywords | `["react", "hooks", "javascript"]` |
| `articleType` | `string` | Type of article | `"How-to Guide"` |
| `language` | `string` | Language variant | `"English (US)"` |
| `articleSize` | `string` | Target word count range | `"Medium (1,200-1,800 words)"` |
| `pov` | `string` | Point of view | `"First Person Singular"` |
| `manualFocusKeyphrase` | `string` | Manual keyphrase override | `"react hooks tutorial"` |
| `imageStyle` | `string` | Featured image style | `"Photorealistic"` |
| `aspectRatio` | `string` | Image aspect ratio | `"16:9"` |
| `sourceContext` | `string` | RSS feed data or source context | `"RSS feed content..."` |
| `category` | `string` | Article category | `"Technical (Development/Engineering)"` |

**Expected Output Format:**
```json
{
  "focusKeyphrase": "react hooks tutorial",
  "seoTitle": "Complete React Hooks Guide: useState, useEffect, and More",
  "slug": "complete-react-hooks-guide",
  "metaDescription": "Learn React Hooks with our comprehensive guide covering useState, useEffect, and advanced patterns for modern React development.",
  "featuredImage": {
    "style": "Photorealistic",
    "aspect": "16:9",
    "alt": "React Hooks tutorial guide",
    "filename": "react-hooks-guide",
    "caption": "Visual guide to React Hooks",
    "prompt": "Professional illustration of React Hooks concepts with code examples"
  }
}
```

**Usage Context:**
- Called during article initialization in the Writer feature
- First step in article generation workflow
- Output is used to populate article metadata card and featured image block

**Implementation:**
```javascript
// backend/src/services/ai/gemini.article.js
export const generateMetadata = async (
  topic, keywords, articleType, language, articleSize, pov,
  manualFocusKeyphrase, imageStyle, aspectRatio, sourceContext, category
) => {
  const systemPrompt = `${SYSTEM_INSTRUCTIONS}\nReturn a JSON object with: focusKeyphrase, seoTitle, slug, metaDescription, and featuredImage object.`;
  const prompt = `Topic: "${topic}"\nKeywords: "${keywords.join(', ')}"\nPOV: ${pov}\nType: ${articleType}\nSourceContext: ${sourceContext}\nManualFocus: ${manualFocusKeyphrase}`;
  
  const text = await callAI(prompt, systemPrompt, true); // jsonMode = true
  return JSON.parse(cleanAIOutput(text) || '{}');
};
```

**API Endpoint:** `POST /api/articles/metadata`

---

### Generate Outline

**Purpose:** Generate an SEO-optimized article outline (array of section headings) based on topic, keywords, and article type.

**Location:** `backend/src/services/ai/gemini.article.js`

**Template:**
```
System Prompt: ${SYSTEM_INSTRUCTIONS}
Return a JSON array of section headings ONLY.

User Prompt:
Create an SEO outline for: "${topic}". Context: ${category}. Keywords: ${keywords.join(',')}
```

**Input Variables:**

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `topic` | `string` | Main article topic | `"React Hooks Guide"` |
| `keywords` | `string[]` | Array of SEO keywords | `["react", "hooks"]` |
| `articleType` | `string` | Type of article | `"How-to Guide"` |
| `language` | `string` | Language variant | `"English (US)"` |
| `articleSize` | `string` | Target word count range | `"Medium (1,200-1,800 words)"` |
| `pov` | `string` | Point of view | `"First Person Singular"` |
| `sourceContext` | `string` | RSS feed data or source context | `"RSS feed content..."` |
| `category` | `string` | Article category | `"Technical (Development/Engineering)"` |

**Expected Output Format:**
```json
[
  "Introduction to React Hooks",
  "Understanding useState Hook",
  "Working with useEffect",
  "Custom Hooks Pattern",
  "Common Hooks Patterns",
  "Best Practices and Tips",
  "Conclusion"
]
```

**Usage Context:**
- Called after metadata generation
- Used to populate section list in Writer interface
- Each heading becomes a section that can be generated individually

**Implementation:**
```javascript
// backend/src/services/ai/gemini.article.js
export const generateOutline = async (
  topic, keywords, articleType, language, articleSize, pov, sourceContext, category
) => {
  const systemPrompt = `${SYSTEM_INSTRUCTIONS}\nReturn a JSON array of section headings ONLY.`;
  const prompt = `Create an SEO outline for: "${topic}". Context: ${category}. Keywords: ${keywords.join(',')}`;
  
  const text = await callAI(prompt, systemPrompt, true); // jsonMode = true
  return JSON.parse(cleanAIOutput(text) || '[]');
};
```

**API Endpoint:** `POST /api/articles/outline`

---

### Generate Section

**Purpose:** Generate HTML content for a specific article section based on section title, topic, and context.

**Location:** `backend/src/services/ai/gemini.article.js`

**Template:**
```
System Prompt: ${SYSTEM_INSTRUCTIONS}

User Prompt:
Write the content for the section: "${sectionTitle}". Topic: "${topic}". Type: "${articleType}". RSS_Data: "${sourceContext}"
```

**Input Variables:**

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `sectionTitle` | `string` | Title of the section to generate | `"Introduction to React Hooks"` |
| `topic` | `string` | Main article topic | `"React Hooks Guide"` |
| `keywords` | `string[]` | Array of SEO keywords | `["react", "hooks"]` |
| `tone` | `string` | Writing tone | `"Professional"` |
| `articleType` | `string` | Type of article | `"How-to Guide"` |
| `language` | `string` | Language variant | `"English (US)"` |
| `articleSize` | `string` | Target word count range | `"Medium (1,200-1,800 words)"` |
| `pov` | `string` | Point of view | `"First Person Singular"` |
| `imageQuantity` | `string` | Number of images to include | `"2"` |
| `aspectRatio` | `string` | Image aspect ratio | `"16:9"` |
| `imageStyle` | `string` | Image style | `"Photorealistic"` |
| `sourceContext` | `string` | RSS feed data or source context | `"RSS feed content..."` |
| `category` | `string` | Article category | `"Technical (Development/Engineering)"` |

**Expected Output Format:**
```html
<h2>Introduction to React Hooks</h2>
<p>React Hooks revolutionized how we write React components by allowing functional components to manage state and side effects...</p>
<!-- IMAGE_PROMPT: { "style": "Photorealistic", "aspect": "16:9", "alt": "React Hooks diagram", "filename": "react-hooks-intro", "caption": "Visual representation of React Hooks", "prompt": "Professional diagram showing React Hooks architecture" } -->
<p>In this comprehensive guide, we'll explore the most commonly used hooks and their practical applications...</p>
```

**Usage Context:**
- Called for each section when user clicks "Generate" on a section
- Output is inserted into the section block in the Writer interface
- May include embedded `IMAGE_PROMPT` comments for image generation

**Implementation:**
```javascript
// backend/src/services/ai/gemini.article.js
export const generateSection = async (
  sectionTitle, topic, keywords, tone, articleType, language, articleSize, pov,
  imageQuantity, aspectRatio, imageStyle, sourceContext, category
) => {
  const systemPrompt = SYSTEM_INSTRUCTIONS;
  const prompt = `Write the content for the section: "${sectionTitle}". Topic: "${topic}". Type: "${articleType}". RSS_Data: "${sourceContext}"`;
  
  const text = await callAI(prompt, systemPrompt, false); // jsonMode = false (HTML output)
  return cleanAIOutput(text);
};
```

**API Endpoint:** `POST /api/articles/section`

**Notes:**
- Output must be raw HTML (no markdown)
- Must start with `<h1>` or `<h2>` tag
- Can include `<!-- IMAGE_PROMPT: ... -->` comments for image placeholders
- Must follow SEO guidelines: 75% sentences under 20 words, paragraphs max 150 words, >90% active voice

---

### Generate CTA

**Purpose:** Generate a branded Call-to-Action (CTA) block for the end of an article.

**Location:** `backend/src/services/ai/gemini.article.js`

**Template:**
```
System Prompt: ${SYSTEM_INSTRUCTIONS}

User Prompt:
Create a branded Nova‑XFinity AI CTA for topic: ${topic}. Keyphrase: ${focusKeyphrase}
```

**Input Variables:**

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `topic` | `string` | Main article topic | `"React Hooks Guide"` |
| `keywords` | `string[]` | Array of SEO keywords | `["react", "hooks"]` |
| `focusKeyphrase` | `string` | Primary focus keyphrase | `"react hooks tutorial"` |

**Expected Output Format:**
```html
<div class="cta-block">
  <h3>Ready to Master React Hooks?</h3>
  <p>Take your React development to the next level with our comprehensive React Hooks tutorial...</p>
  <a href="#" class="cta-button">Get Started with Nova‑XFinity AI</a>
</div>
```

**Usage Context:**
- Called when user adds a CTA block to the article
- Typically placed at the end of articles
- Branded with "Nova‑XFinity AI" messaging

**Implementation:**
```javascript
// backend/src/services/ai/gemini.article.js
export const generateCTA = async (topic, keywords, focusKeyphrase) => {
  const text = await callAI(
    `Create a branded Nova‑XFinity AI CTA for topic: ${topic}. Keyphrase: ${focusKeyphrase}`,
    SYSTEM_INSTRUCTIONS,
    false // HTML output
  );
  return cleanAIOutput(text);
};
```

**API Endpoint:** `POST /api/articles/cta`

---

### Check Plagiarism

**Purpose:** Analyze article content for originality and potential plagiarism issues.

**Location:** `backend/src/services/ai/gemini.article.js`

**Template:**
```
System Prompt: ${SYSTEM_INSTRUCTIONS}

User Prompt:
Scan for originality: ${content.substring(0, 5000)}
```

**Input Variables:**

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `content` | `string` | Article content to check | `"<h1>Article content...</h1>"` |

**Expected Output Format:**
```json
{
  "originalityScore": 95,
  "flaggedSections": [],
  "recommendations": [
    "Content appears original",
    "Consider adding more unique insights"
  ],
  "similarityPercentage": 5
}
```

**Usage Context:**
- Called when user requests plagiarism check
- Content is truncated to first 5000 characters for analysis
- Used to ensure content originality before publishing

**Implementation:**
```javascript
// backend/src/services/ai/gemini.article.js
export const checkPlagiarism = async (content) => {
  const text = await callAI(
    `Scan for originality: ${content.substring(0, 5000)}`,
    SYSTEM_INSTRUCTIONS,
    true // JSON output
  );
  return JSON.parse(cleanAIOutput(text) || '{}');
};
```

**API Endpoint:** `POST /api/articles/plagiarism`

**Notes:**
- Content is limited to 5000 characters for API efficiency
- Returns JSON with originality metrics and recommendations

---

### Analyze SEO

**Purpose:** Perform SEO audit on article content, analyzing keyphrase density, readability, and optimization opportunities.

**Location:** `backend/src/services/ai/gemini.article.js`

**Template:**
```
System Prompt: ${SYSTEM_INSTRUCTIONS}

User Prompt:
SEO audit: ${keywords[0]}. Content: ${content.substring(0, 5000)}
```

**Input Variables:**

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `content` | `string` | Article content to analyze | `"<h1>Article content...</h1>"` |
| `keywords` | `string[]` | Array of SEO keywords (first used as focus) | `["react hooks", "react tutorial"]` |

**Expected Output Format:**
```json
{
  "overallScore": 85,
  "metrics": {
    "keyphraseDensity": 2.5,
    "avgSentenceLength": 18,
    "introPresence": true,
    "passiveVoicePercentage": 8,
    "subheadingDistribution": "Well-structured with H2 and H3 tags"
  },
  "readabilityLabel": "Easy to Read",
  "suggestions": [
    "Increase keyphrase density to 2.5-3%",
    "Add keyphrase to one more subheading",
    "Reduce average sentence length slightly"
  ]
}
```

**Usage Context:**
- Called when user requests SEO audit in Writer interface
- Displays results in SEO Audit Report component
- Content is truncated to first 5000 characters for analysis

**Implementation:**
```javascript
// backend/src/services/ai/gemini.article.js
export const analyzeSEO = async (content, keywords) => {
  const text = await callAI(
    `SEO audit: ${keywords[0]}. Content: ${content.substring(0, 5000)}`,
    SYSTEM_INSTRUCTIONS,
    true // JSON output
  );
  return JSON.parse(cleanAIOutput(text) || '{}');
};
```

**API Endpoint:** `POST /api/articles/seo`

**Notes:**
- Uses first keyword as primary focus keyphrase
- Content is limited to 5000 characters for API efficiency
- Returns comprehensive SEO metrics and actionable suggestions

---

## Media Domain

### Generate Image

**Purpose:** Generate a high-quality image from a text prompt with specified style and aspect ratio.

**Location:** `backend/src/services/ai/gemini.media.js`

**Template:**
```
Model: gemini-2.5-flash-image

Prompt:
Professional asset. Style: ${style}. Subject: ${prompt}.

Configuration:
{
  "imageConfig": {
    "aspectRatio": "${aspectRatio}"
  }
}
```

**Input Variables:**

| Variable | Type | Description | Example | Default |
|----------|------|-------------|---------|---------|
| `prompt` | `string` | Text description of image | `"A futuristic cityscape at sunset"` | Required |
| `aspectRatio` | `string` | Image aspect ratio | `"16:9"` | `"16:9"` |
| `style` | `string` | Visual style | `"Photorealistic"` | `"Photorealistic"` |

**Supported Aspect Ratios:**
- `"1:1"` (Square)
- `"4:3"` (Standard)
- `"3:4"` (Portrait)
- `"16:9"` (Widescreen)
- `"9:16"` (Vertical)

**Supported Styles:**
- `"Photorealistic"`
- `"Cinematic"`
- `"Minimalist"`
- `"3D Render"`
- `"Digital Illustration"`
- `"Vintage Photography"`
- `"Corporate Clean"`

**Expected Output Format:**
```
data:image/png;base64,{base64_encoded_image_data}
```

**Usage Context:**
- Called from Media Hub for standalone image generation
- Called from Writer ImageBlock component when generating article images
- Used for featured images and inline article images

**Implementation:**
```javascript
// backend/src/services/ai/gemini.media.js
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
```

**API Endpoint:** `POST /api/media/images`

**Notes:**
- Returns base64-encoded PNG image as data URI
- Image generation is synchronous (returns immediately)
- Model: `gemini-2.5-flash-image`

---

### Edit Image

**Purpose:** Modify an existing image based on a text prompt describing desired changes.

**Location:** `backend/src/services/ai/gemini.media.js`

**Template:**
```
Model: gemini-2.5-flash-image

Input:
- Base64 image data (inlineData)
- Text prompt: Modify the provided image: "${prompt}".

Configuration:
{
  "imageConfig": {
    "aspectRatio": "${aspectRatio}"
  }
}
```

**Input Variables:**

| Variable | Type | Description | Example | Default |
|----------|------|-------------|---------|---------|
| `base64ImageData` | `string` | Base64 encoded image (with or without data URI prefix) | `"data:image/png;base64,..."` | Required |
| `mimeType` | `string` | MIME type of input image | `"image/png"` | Required |
| `prompt` | `string` | Description of desired modifications | `"Add a sunset sky in the background"` | Required |
| `aspectRatio` | `string` | Output aspect ratio | `"16:9"` | `"16:9"` |

**Expected Output Format:**
```
data:image/png;base64,{base64_encoded_edited_image_data}
```

**Usage Context:**
- Called from Writer ImageBlock when user clicks "AI Refinement"
- Allows users to iteratively improve generated images
- Used for fine-tuning article images

**Implementation:**
```javascript
// backend/src/services/ai/gemini.media.js
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
```

**API Endpoint:** `POST /api/media/images/edit`

**Notes:**
- Base64 data can include or exclude `data:image/png;base64,` prefix
- Returns edited image as base64-encoded PNG data URI
- Model: `gemini-2.5-flash-image`

---

### Generate Video

**Purpose:** Generate a short-form video from a text prompt with style, resolution, aspect ratio, and duration control.

**Location:** `backend/src/services/ai/gemini.media.js`

**Template:**
```
Model: veo-3.1-fast-generate-preview

Prompt:
Visual Style: ${style}. Duration: ${duration}. ${prompt}

Configuration:
{
  "numberOfVideos": 1,
  "resolution": "${resolution}",
  "aspectRatio": "${aspectRatio}"
}

Optional:
{
  "image": {
    "imageBytes": "${startFrameBase64}",
    "mimeType": "image/png"
  }
}
```

**Input Variables:**

| Variable | Type | Description | Example | Default |
|----------|------|-------------|---------|---------|
| `prompt` | `string` | Text description of video | `"A drone flying over a mountain range"` | Required |
| `style` | `string` | Visual style | `"Cinematic"` | `"Cinematic"` |
| `resolution` | `string` | Video resolution | `"1080p"` | `"720p"` |
| `aspectRatio` | `string` | Video aspect ratio | `"16:9"` | `"16:9"` |
| `duration` | `string` | Video duration | `"15s"` | `"9s"` |
| `startFrameBase64` | `string\|null` | Optional starting frame image | `"data:image/png;base64,..."` | `null` |

**Supported Resolutions:**
- `"720p"`
- `"1080p"`

**Supported Aspect Ratios:**
- `"16:9"` (Widescreen)
- `"9:16"` (Portrait/Vertical)

**Supported Durations:**
- `"5s"`
- `"9s"`
- `"25s"`

**Expected Output Format:**
```
https://generativelanguage.googleapis.com/v1beta/{operation_id}?key={api_key}
```

**Usage Context:**
- Called from Media Hub for video generation
- Video generation is asynchronous (returns operation URL)
- Operation must be polled until completion
- Used for social media content and article video assets

**Implementation:**
```javascript
// backend/src/services/ai/gemini.media.js
export const generateVideo = async (
  prompt, style = 'Cinematic', resolution = '720p', 
  aspectRatio = '16:9', duration = '9s', startFrameBase64 = null
) => {
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
  
  // Poll until operation completes
  while (!operation.done) {
    await new Promise(r => setTimeout(r, 10000)); // Wait 10 seconds
    operation = await ai.operations.getVideosOperation({operation});
    
    if (operation.error) {
      throw new Error(`Video Generation Operation Failed: ${operation.error.message || 'Unknown Error'}`);
    }
  }
  
  const videoMeta = operation.response?.generatedVideos?.[0]?.video;
  if (!videoMeta || !videoMeta.uri) {
    throw new Error("Video generation completed but no URI was returned.");
  }
  
  const downloadLink = videoMeta.uri;
  const separator = downloadLink.includes('?') ? '&' : '?';
  return `${downloadLink}${separator}key=${apiKey}`;
};
```

**API Endpoint:** `POST /api/media/videos`

**Notes:**
- Video generation is **asynchronous** - operation must be polled
- Polling interval: 10 seconds
- Returns download URL with API key appended
- Model: `veo-3.1-fast-generate-preview`
- Can optionally start from a base64-encoded image frame

---

### Generate Audio (TTS)

**Purpose:** Convert text to speech using AI voice synthesis with professional marketing tone.

**Location:** `backend/src/services/ai/gemini.media.js`

**Template:**
```
Model: gemini-2.5-flash-preview-tts

Prompt:
Say with a professional marketing tone: ${text}

Configuration:
{
  "responseModalities": ["AUDIO"],
  "speechConfig": {
    "voiceConfig": {
      "prebuiltVoiceConfig": {
        "voiceName": "${voice}"
      }
    }
  }
}
```

**Input Variables:**

| Variable | Type | Description | Example | Default |
|----------|------|-------------|---------|---------|
| `text` | `string` | Text to convert to speech | `"Welcome to our React Hooks tutorial"` | Required |
| `voice` | `string` | Voice name | `"Kore"` | `"Kore"` |

**Expected Output Format:**
```
data:audio/pcm;base64,{base64_encoded_audio_data}
```

**Usage Context:**
- Called from Media Hub for audio generation
- Used for podcast intros, article narration, and voiceovers
- Audio format: PCM (Pulse Code Modulation)

**Implementation:**
```javascript
// backend/src/services/ai/gemini.media.js
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
```

**API Endpoint:** `POST /api/media/audio`

**Notes:**
- Returns PCM audio as base64-encoded data URI
- Audio format: `data:audio/pcm;base64,...`
- Sample rate: 24000 Hz (default)
- Channels: 1 (mono)
- Model: `gemini-2.5-flash-preview-tts`
- Voice options may vary by provider

---

## Prompt Maintenance Guidelines

### Consistency

1. **Naming Conventions:**
   - Use descriptive function names: `generateMetadata`, `generateSection`, etc.
   - Prefix media functions with media type: `generateImage`, `generateVideo`, `generateAudio`

2. **Variable Naming:**
   - Use camelCase for JavaScript variables
   - Use descriptive names: `sectionTitle` not `title`, `focusKeyphrase` not `keyphrase`

3. **Output Format:**
   - Article prompts: HTML output (raw HTML, no markdown)
   - Metadata/analysis prompts: JSON output
   - Media prompts: Base64 data URIs

### Clarity

1. **Template Structure:**
   - Always include System Prompt and User Prompt sections
   - Document all input variables in a table
   - Provide example values for each variable

2. **Documentation:**
   - Explain the purpose of each prompt
   - Document expected output format with examples
   - Include usage context and implementation examples

3. **Error Handling:**
   - Document potential error cases
   - Include fallback behavior (e.g., JSON parsing with default values)

### Maintainability

1. **Centralization:**
   - Keep base system instructions in `constants.js`
   - Import and reuse `SYSTEM_INSTRUCTIONS` across all article prompts
   - Avoid duplicating prompt logic

2. **Version Control:**
   - Document prompt changes in commit messages
   - Track prompt performance and iterate based on results
   - Maintain backward compatibility when possible

3. **Testing:**
   - Test prompts with various input combinations
   - Validate output format matches expected structure
   - Monitor prompt performance and adjust as needed

4. **Provider Compatibility:**
   - Document provider-specific optimizations in System Instructions
   - Ensure prompts work across all supported providers (Gemini, OpenAI, Claude, Llama)
   - Test fallback behavior when primary provider fails

### Best Practices

1. **Prompt Engineering:**
   - Be specific about output format requirements
   - Include examples in prompts when helpful
   - Use clear, concise language
   - Avoid ambiguous instructions

2. **Input Validation:**
   - Validate required parameters before calling AI
   - Sanitize user input to prevent prompt injection
   - Truncate long inputs to prevent token limits

3. **Output Processing:**
   - Always use `cleanAIOutput()` for article content
   - Parse JSON outputs with error handling
   - Validate output structure matches expected format

4. **Performance:**
   - Limit content length for analysis prompts (5000 chars)
   - Use appropriate models for each task
   - Implement caching where appropriate

---

## Related Documentation

- [AI Service Flow](../planning/ai-service-flow.md) - Overall AI service architecture
- [Provider Integration](../architecture/provider-integration.md) - Multi-provider support
- [Backend Architecture](../architecture/backend-architecture.md) - Backend service structure
