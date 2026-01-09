
export const SYSTEM_INSTRUCTIONS = `ROLE: You are the Nova‑XFinity AI SEO Content Engine, a Senior Technical Journalist. Your purpose is to generate high-ranking, human-readable WordPress articles.

I. OUTPUT ARCHITECTURE & LAYOUT
Context: You output content for the Editor Workspace (Layer 2).
Strict Format: Output RAW HTML ONLY.
Negative Constraints: 
- NO conversational filler.
- NO markdown code fences.
- Start immediately with the first <h1> or <h2> tag.

II. POST CONFIGURATION PARAMETERS
- Adhere to Article Type, Language (regional spelling), Article Size, and POV.

III. MEDIA FINITYHUB (IMAGE LOGIC)
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
Objective: Process real-time expert data. Use Synthesis Mode for RSS summaries. Citations are mandatory.`;

export const PROVIDER_OPTIONS = [
  { id: 'gemini', label: 'Google Gemini', icon: 'fa-google', badge: 'context-king' },
  { id: 'openai', label: 'OpenAI (GPT)', icon: 'fa-bolt', badge: 'creative-pro' },
  { id: 'anthropic', label: 'Claude (Anthropic)', icon: 'fa-brain', badge: 'technical-guru' },
  { id: 'llama', label: 'Llama (Groq)', icon: 'fa-microchip', badge: 'speed-demon' }
];

export const TONE_OPTIONS = ['Professional', 'Conversational', 'Witty', 'Informative', 'Persuasive'];

export const CATEGORY_OPTIONS = [
  'Technical (Development/Engineering)',
  'Strategic (Innovation/Marketing)',
  'Insights & Education',
  'News & Trends',
  'Case Studies'
];

export const POV_OPTIONS = [
  'None (Neutral/Mix)',
  'First Person Singular (I, me, my)',
  'First Person Plural (we, us, our)',
  'Second Person (you, your)',
  'Third Person (he, she, they, it)'
];

export const ARTICLE_SIZE_OPTIONS = [
  'Small (600-900 words)',
  'Medium (1,200-1,800 words)',
  'Large (2,500+ words)'
];

export const IMAGE_QUANTITY_OPTIONS = ['1', '2', '3', '4', '5', '6'];

export const ASPECT_RATIO_OPTIONS = ['1:1', '4:3', '3:4', '16:9', '9:16'];
// Veo 3.1 specifically supports 16:9 and 9:16
export const VIDEO_ASPECT_RATIO_OPTIONS = ['16:9', '9:16'];
export const VIDEO_DURATION_OPTIONS = ['5s', '9s', '25s'];

export const IMAGE_STYLE_OPTIONS = [
  'Photorealistic',
  'Cinematic',
  'Minimalist',
  '3D Render',
  'Digital Illustration',
  'Vintage Photography',
  'Corporate Clean'
];

export const LANGUAGE_OPTIONS = [
  { label: 'English (US)', flag: '🇺🇸' },
  { label: 'English (UK)', flag: '🇬🇧' },
  { label: 'English (Australia)', flag: '🇦🇺' },
  { label: 'English (Canada)', flag: '🇨🇦' },
  { label: 'French', flag: '🇫🇷' },
  { label: 'German', flag: '🇩🇪' },
  { label: 'Spanish', flag: '🇪🇸' },
  { label: 'Italian', flag: '🇮🇹' },
  { label: 'Portuguese', flag: '🇵🇹' },
  { label: 'Dutch', flag: '🇳🇱' },
  { label: 'Japanese', flag: '🇯🇵' },
  { label: 'Chinese (Simplified)', flag: '🇨🇳' }
];

export const ARTICLE_TYPE_OPTIONS = [
  'None (General Post)', 'How-to guide', 'Listicle', 'Product review', 'News', 'Comparison', 'Case study', 'Tutorial', 'Roundup post', 'Q&A page'
];

export const ROADMAP_DATA = [
  { step: 'Multi-Provider Core', tech: 'Hybrid API Layer', desc: 'Switch seamlessly between Gemini, OpenAI, Claude, and Llama based on content requirements.' },
  { step: 'Pulse Mode / RSS Synthesis', tech: 'RSS Analyst Persona', desc: 'Transform raw RSS feeds into authoritative posts.' },
  { step: 'Automatic Fallback', tech: 'Reliability Protocol', desc: 'If a provider hits limits, the agent automatically swaps to an available backup key.' }
];
