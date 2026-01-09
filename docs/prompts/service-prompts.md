# Service Prompt Structures

This document defines the structure and examples of prompt formats used by each AI service within the Nova‑XFinity ecosystem. Each service section includes required/optional fields, formatting rules, examples, special tokens, and supported models.

---

## Table of Contents

- [1. Image Generation](#1-image-generation)
- [2. Content Writing](#2-content-writing)
- [3. Research Assistant](#3-research-assistant)
- [4. Voiceover Generator](#4-voiceover-generator)
- [5. AI Coding Helper](#5-ai-coding-helper)

---

## 1. Image Generation

**Service Purpose:** Generate high-quality images from text prompts with style and aspect ratio control.

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `prompt` | `string` | Text description of the image | `"A futuristic cityscape at sunset"` |
| `style` | `string` | Visual style for the image | `"Photorealistic"` |
| `model` | `string` | AI model identifier | `"gemini-2.5-flash-image"` |
| `aspectRatio` | `string` | Image dimensions ratio | `"16:9"` |

### Optional Fields

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `mimeType` | `string` | Image MIME type (for editing) | `"image/png"` |
| `base64ImageData` | `string` | Base64 image data (for editing) | `null` |

### Prompt Formatting Rules

1. **System Prompt → User Prompt → Modifiers**
   - System prompt: Not used (direct model call)
   - User prompt: `"Professional asset. Style: ${style}. Subject: ${prompt}."`
   - Configuration: Aspect ratio specified in model config

2. **Format Structure:**
   ```
   Model: gemini-2.5-flash-image
   
   Prompt: Professional asset. Style: ${style}. Subject: ${prompt}.
   
   Configuration:
   {
     "imageConfig": {
       "aspectRatio": "${aspectRatio}"
     }
   }
   ```

### Example Prompts

**Example 1: Basic Image Generation**
```javascript
{
  prompt: "A modern workspace with natural lighting",
  style: "Photorealistic",
  model: "gemini-2.5-flash-image",
  aspectRatio: "16:9"
}
```

**Example 2: Image Editing**
```javascript
{
  prompt: "Add a sunset sky in the background",
  style: "Photorealistic",
  model: "gemini-2.5-flash-image",
  aspectRatio: "16:9",
  base64ImageData: "data:image/png;base64,...",
  mimeType: "image/png"
}
```

### Special Tokens

- `IMAGE_PROMPT` comment: `<!-- IMAGE_PROMPT: { "style": "...", "aspect": "...", "alt": "...", "filename": "...", "caption": "...", "prompt": "..." } -->`
  - Used in article content to mark image generation points
  - Parsed by Writer component to trigger inline image generation

### Supported Models

- **Primary:** `gemini-2.5-flash-image` (Google Gemini)
- **Planned Fallbacks:** Stability AI, Replicate

### Supported Styles

- `"Photorealistic"`
- `"Cinematic"`
- `"Minimalist"`
- `"3D Render"`
- `"Digital Illustration"`
- `"Vintage Photography"`
- `"Corporate Clean"`
- `"Abstract"`
- `"Technical Diagram"`
- `"Data Visualization"`

### Supported Aspect Ratios

- `"1:1"` (Square)
- `"4:3"` (Standard)
- `"3:4"` (Portrait)
- `"16:9"` (Widescreen)
- `"9:16"` (Vertical)

### Output Format

- Base64-encoded PNG data URI: `data:image/png;base64,{base64_encoded_image_data}`

### Implementation Location

- **Service:** `backend/src/features/gemini/services/geminiMediaService.js`
- **API Endpoint:** `POST /api/media/images`
- **Frontend:** `frontend/src/features/media/ImageGeneration.js`

---

## 2. Content Writing

**Service Purpose:** Generate SEO-optimized articles with structured metadata, outlines, and sections.

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `topic` | `string` | Main article topic/subject | `"React Hooks Guide"` |
| `keywords` | `string[]` | Array of SEO keywords | `["react", "hooks", "javascript"]` |
| `articleType` | `string` | Type of article | `"How-to Guide"` |
| `language` | `string` | Language variant | `"English (US)"` |
| `articleSize` | `string` | Target word count range | `"Medium (1,200-1,800 words)"` |
| `pov` | `string` | Point of view | `"First Person Singular"` |

### Optional Fields

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `manualFocusKeyphrase` | `string` | Manual keyphrase override | `""` |
| `imageStyle` | `string` | Featured image style | `"Photorealistic"` |
| `aspectRatio` | `string` | Image aspect ratio | `"16:9"` |
| `sourceContext` | `string` | RSS feed data or source context | `""` |
| `category` | `string` | Article category | `"Technical (Development/Engineering)"` |
| `tone` | `string` | Writing tone | `"Professional"` |
| `imageQuantity` | `number` | Number of images per section | `2` |
| `SEO` | `boolean` | Enable SEO optimization | `true` |
| `metadata` | `object` | Additional metadata | `null` |

### Prompt Formatting Rules

1. **System Prompt → User Prompt → Modifiers**
   - System prompt: `SYSTEM_INSTRUCTIONS` (from `constants.js`)
   - User prompt: Structured with topic, keywords, type, context
   - Modifiers: Provider-specific optimizations applied automatically

2. **Format Structure:**
   ```
   System Prompt: ${SYSTEM_INSTRUCTIONS}
   [Optional: Return format instruction]
   
   User Prompt:
   Topic: "${topic}"
   Keywords: "${keywords.join(', ')}"
   POV: ${pov}
   Type: ${articleType}
   SourceContext: ${sourceContext}
   ManualFocus: ${manualFocusKeyphrase}
   ```

3. **System Instructions Include:**
   - Role definition: "Nova‑XFinity AI SEO Content Engine, Senior Technical Journalist"
   - Output format: Raw HTML only (no markdown)
   - SEO guidelines: 75% sentences under 20 words, paragraphs max 150 words, >90% active voice
   - Provider-specific logic: Gemini (RSS feeds), Claude (technical accuracy), OpenAI (creative hooks), Llama (speed)

### Example Prompts

**Example 1: Generate Metadata**
```javascript
{
  topic: "Complete Guide to React Hooks",
  keywords: ["react", "hooks", "javascript", "frontend"],
  articleType: "How-to Guide",
  language: "English (US)",
  articleSize: "Medium (1,200-1,800 words)",
  pov: "First Person Singular",
  manualFocusKeyphrase: "react hooks tutorial",
  imageStyle: "Photorealistic",
  aspectRatio: "16:9",
  sourceContext: "",
  category: "Technical (Development/Engineering)"
}
```

**System Prompt:**
```
${SYSTEM_INSTRUCTIONS}
Return a JSON object with: focusKeyphrase, seoTitle, slug, metaDescription, and featuredImage object.
```

**User Prompt:**
```
Topic: "Complete Guide to React Hooks"
Keywords: "react, hooks, javascript, frontend"
POV: First Person Singular
Type: How-to Guide
SourceContext: 
ManualFocus: react hooks tutorial
```

**Example 2: Generate Section**
```javascript
{
  sectionTitle: "Introduction to React Hooks",
  topic: "Complete Guide to React Hooks",
  keywords: ["react", "hooks"],
  tone: "Professional",
  articleType: "How-to Guide",
  language: "English (US)",
  articleSize: "Medium (1,200-1,800 words)",
  pov: "First Person Singular",
  imageQuantity: 2,
  aspectRatio: "16:9",
  imageStyle: "Photorealistic",
  sourceContext: "",
  category: "Technical (Development/Engineering)"
}
```

**System Prompt:**
```
${SYSTEM_INSTRUCTIONS}
```

**User Prompt:**
```
Write the content for the section: "Introduction to React Hooks". Topic: "Complete Guide to React Hooks". Type: "How-to Guide". RSS_Data: ""
```

### Special Tokens

- `IMAGE_PROMPT` comment: `<!-- IMAGE_PROMPT: { "style": "...", "aspect": "...", "alt": "...", "filename": "...", "caption": "...", "prompt": "..." } -->`
  - Embedded in section content to mark image generation points
  - Automatically parsed and converted to images by Writer component

### Supported Models

- **Primary:** User-selected provider (Gemini, OpenAI, Claude, Llama)
- **Fallback:** Gemini (automatic on failure)
- **Models:**
  - `gemini-3-pro-preview` (Google Gemini)
  - `gpt-4o` (OpenAI)
  - `claude-3-5-sonnet-20241022` (Anthropic)
  - `llama-3.3-70b` (Groq)

### Output Formats

- **Metadata:** JSON object with `focusKeyphrase`, `seoTitle`, `slug`, `metaDescription`, `featuredImage`
- **Outline:** JSON array of section heading strings
- **Section:** Raw HTML content (no markdown fences, starts with `<h1>` or `<h2>`)
- **CTA:** HTML block with branded styling

### Implementation Location

- **Service:** `backend/src/features/gemini/services/geminiWriterService.js`
- **API Endpoints:**
  - `POST /api/articles/metadata`
  - `POST /api/articles/outline`
  - `POST /api/articles/section`
  - `POST /api/articles/cta`
- **Frontend:** `frontend/src/features/writer/WriterMain.js`

---

## 3. Research Assistant

**Service Purpose:** Perform research queries with Google Search integration to provide real-time, grounded information with citations.

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `query` | `string` | Research question or topic | `"Latest statistics on AI adoption in healthcare"` |
| `userId` | `string` | User ID for tracking | `"user_123"` |

### Optional Fields

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `focus` | `string` | Research focus type | `"all"` |
| `maxResults` | `number` | Maximum number of sources | `10` |
| `timeRange` | `string` | Time range for results | `"all"` |

### Prompt Formatting Rules

1. **System Prompt → User Prompt → Modifiers**
   - System prompt: Not explicitly set (uses model defaults)
   - User prompt: `"Deep Research: ${query}"`
   - Modifiers: Google Search tool enabled via model configuration

2. **Format Structure:**
   ```
   Model: gemini-3-pro-preview
   Tools: [{ googleSearch: {} }]
   
   Prompt: Deep Research: ${query}
   ```

3. **Google Search Integration:**
   - Uses Gemini's built-in `googleSearch` tool
   - Automatically extracts grounding metadata
   - Filters and maps web sources to citations

### Example Prompts

**Example 1: Basic Research Query**
```javascript
{
  userId: "user_123",
  query: "Latest statistics on React framework adoption in enterprise applications"
}
```

**Prompt:**
```
Deep Research: Latest statistics on React framework adoption in enterprise applications
```

**Example 2: Research with Options**
```javascript
{
  userId: "user_123",
  query: "Current trends in renewable energy 2024",
  focus: "trends",
  maxResults: 15,
  timeRange: "year"
}
```

**Prompt:**
```
Deep Research: Current trends in renewable energy 2024
```

### Special Tokens

- **Grounding Metadata:** Automatically extracted from response
  - Format: `response.candidates[0].groundingMetadata.groundingChunks`
  - Filtered for web sources: `chunk.web`
  - Mapped to: `{ title: chunk.web.title, uri: chunk.web.uri }`

### Supported Models

- **Primary:** `gemini-3-pro-preview` (Google Gemini with Google Search tool)
- **Fallback:** Standard Gemini (without search tool)

### Output Format

```json
{
  "summary": "Research synthesis text with citations...",
  "sources": [
    {
      "title": "Source Title",
      "uri": "https://example.com/article"
    }
  ]
}
```

### Implementation Location

- **Service:** `backend/src/features/providers/gemini/services/ResearchService.js`
- **API Endpoint:** `POST /api/research/query`
- **Frontend:** `components/Research.js`

---

## 4. Voiceover Generator

**Service Purpose:** Convert text to speech using AI voice synthesis with professional marketing tone.

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `text` | `string` | Text to convert to speech | `"Welcome to our React Hooks tutorial"` |

### Optional Fields

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `voice` | `string` | Voice name | `"Kore"` |
| `tone` | `string` | Speaking tone | `"professional marketing"` |

### Prompt Formatting Rules

1. **System Prompt → User Prompt → Modifiers**
   - System prompt: Not used (direct model call)
   - User prompt: `"Say with a professional marketing tone: ${text}"`
   - Configuration: Audio modality and voice config specified in model config

2. **Format Structure:**
   ```
   Model: gemini-2.5-flash-preview-tts
   
   Prompt: Say with a professional marketing tone: ${text}
   
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

### Example Prompts

**Example 1: Basic Voiceover**
```javascript
{
  text: "Welcome to our comprehensive guide on React Hooks. In this tutorial, we'll explore the fundamentals of React Hooks and how they revolutionize component development.",
  voice: "Kore"
}
```

**Prompt:**
```
Say with a professional marketing tone: Welcome to our comprehensive guide on React Hooks. In this tutorial, we'll explore the fundamentals of React Hooks and how they revolutionize component development.
```

**Example 2: Video Introduction Voiceover**
```javascript
{
  text: "Welcome to this Cinematic presentation about modern web development practices and best practices for building scalable applications.",
  voice: "Kore"
}
```

**Prompt:**
```
Say with a professional marketing tone: Welcome to this Cinematic presentation about modern web development practices and best practices for building scalable applications.
```

### Special Tokens

- **Audio Data URI:** `data:audio/pcm;base64,{base64_encoded_audio_data}`
- **Decoding:** Requires Web Audio API for playback
  - Sample rate: 24000 Hz
  - Channels: 1 (mono)
  - Format: PCM (Pulse Code Modulation)

### Supported Models

- **Primary:** `gemini-2.5-flash-preview-tts` (Google Gemini TTS)
- **Planned Fallbacks:** ElevenLabs, Suno

### Supported Voices

- `"Kore"` (default)
- Additional voices (provider-dependent)

### Output Format

- Base64-encoded PCM audio data URI: `data:audio/pcm;base64,{base64_encoded_audio_data}`
- Decoded via Web Audio API for browser playback

### Implementation Location

- **Service:** `backend/src/features/gemini/services/geminiMediaService.js`
- **API Endpoint:** `POST /api/media/audio` (planned)
- **Frontend:** `frontend/src/features/media/MediaHubMain.js`

**Note:** Currently, audio generation requires REST API implementation as the SDK doesn't fully support TTS yet.

---

## 5. AI Coding Helper

**Service Purpose:** Generate code snippets, functions, and scripts based on natural language descriptions.

**Status:** Planned (not yet implemented)

### Required Fields (Planned)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `description` | `string` | Natural language code description | `"Create a function that validates email addresses"` |
| `language` | `string` | Programming language | `"javascript"` |

### Optional Fields (Planned)

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| `context` | `string` | Additional context or requirements | `""` |
| `style` | `string` | Code style preferences | `"modern"` |
| `includeTests` | `boolean` | Generate unit tests | `false` |
| `includeDocs` | `boolean` | Generate documentation | `false` |

### Prompt Formatting Rules (Planned)

1. **System Prompt → User Prompt → Modifiers**
   - System prompt: `"You are an expert ${language} developer. Generate clean, well-documented code following best practices."`
   - User prompt: `"Generate ${language} code for: ${description}"`
   - Modifiers: Style preferences, test requirements, documentation needs

2. **Format Structure (Planned):**
   ```
   System Prompt: You are an expert ${language} developer. Generate clean, well-documented code following best practices. ${style ? `Use ${style} coding style.` : ''} ${includeTests ? 'Include unit tests.' : ''} ${includeDocs ? 'Include JSDoc comments.' : ''}
   
   User Prompt:
   Generate ${language} code for: ${description}
   Context: ${context}
   ```

### Example Prompts (Planned)

**Example 1: Basic Code Generation**
```javascript
{
  description: "Create a function that validates email addresses using regex",
  language: "javascript",
  style: "modern",
  includeTests: true,
  includeDocs: true
}
```

**System Prompt:**
```
You are an expert javascript developer. Generate clean, well-documented code following best practices. Use modern coding style. Include unit tests. Include JSDoc comments.
```

**User Prompt:**
```
Generate javascript code for: Create a function that validates email addresses using regex
Context: 
```

**Example 2: React Component Generation**
```javascript
{
  description: "Create a React component that displays a user profile card with avatar, name, and email",
  language: "javascript",
  context: "Using React 18+ with hooks, styled with Tailwind CSS",
  style: "modern",
  includeTests: false,
  includeDocs: true
}
```

**System Prompt:**
```
You are an expert javascript developer. Generate clean, well-documented code following best practices. Use modern coding style. Include JSDoc comments.
```

**User Prompt:**
```
Generate javascript code for: Create a React component that displays a user profile card with avatar, name, and email
Context: Using React 18+ with hooks, styled with Tailwind CSS
```

### Special Tokens (Planned)

- Code block markers: ````language` for syntax highlighting
- Test markers: `// TEST:` for test code sections
- Documentation markers: `/** JSDoc */` for function documentation

### Supported Models (Planned)

- **Primary:** User-selected provider (Gemini, OpenAI, Claude)
- **Recommended:** `claude-3-5-sonnet-20241022` (for code generation accuracy)
- **Fallback:** `gemini-3-pro-preview`

### Supported Languages (Planned)

- `"javascript"` / `"typescript"`
- `"python"`
- `"java"`
- `"go"`
- `"rust"`
- `"sql"`
- `"html"` / `"css"`

### Output Format (Planned)

- Code string with syntax highlighting markers
- Optional: Separate test file
- Optional: Documentation comments

### Implementation Location (Planned)

- **Service:** `backend/src/features/gemini/services/geminiCodeService.js` (new)
- **API Endpoint:** `POST /api/code/generate` (planned)
- **Frontend:** `frontend/src/features/code/CodeGenerator.js` (planned)

---

## General Prompt Guidelines

### Best Practices

1. **Be Specific:** Include all relevant context and requirements
2. **Use Examples:** Reference similar outputs when possible
3. **Set Constraints:** Specify output format, length, style clearly
4. **Provider Optimization:** Leverage provider-specific strengths (Gemini for context, Claude for accuracy, OpenAI for creativity)

### Common Patterns

1. **System Instructions First:** Always prefix with system role/instructions
2. **Structured User Input:** Use clear field labels (Topic:, Keywords:, etc.)
3. **Output Format Hints:** Specify JSON, HTML, or text format expectations
4. **Error Handling:** Include fallback instructions for edge cases

### Token Management

- **Content Writing:** ~500-2000 tokens per section
- **Image Generation:** ~50-100 tokens per prompt
- **Research:** ~1000-5000 tokens (varies with source count)
- **Voiceover:** ~10-50 tokens per second of audio
- **Code Generation:** ~200-1000 tokens per function/component

---

## Related Documentation

- [AI Service Flow](../planning/ai-service-flow.md) - Overall AI service architecture
- [Provider Integration](../architecture/provider-integration.md) - Multi-provider support
- [Backend Architecture](../architecture/backend-architecture.md) - Backend service structure
- [UI Context Map](../development/ui-context-map.md) - Frontend component mappings
