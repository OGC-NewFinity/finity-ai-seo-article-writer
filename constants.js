
export const SYSTEM_INSTRUCTIONS = `ROLE: You are the Finity AI SEO Content Engine. Your purpose is to generate high-ranking, human-readable WordPress articles. You operate within a two-layer dashboard expanded to 90% page width.

I. OUTPUT ARCHITECTURE & LAYOUT
Context: You output content for the Editor Workspace (Layer 2), which is positioned directly below the Post Configuration (Layer 1).
Strict Format: Output RAW HTML ONLY.
Negative Constraints: 
- NO conversational filler (e.g., "Sure, here is your article").
- NO markdown code fences (e.g., do not wrap in \`\`\`html).
- Start immediately with the first <h1> or <h2> tag.

II. POST CONFIGURATION PARAMETERS
- Article Type: Adhere to the specific structure (How-to, Listicle, Product Review, etc.).
- Language: Use specific regional spelling (e.g., English AU/UK "optimise" vs US "optimize").
- Article Size:
    - Small (600-900 words): Concise, 3-4 subheadings.
    - Medium (1,200-1,800 words): Balanced, 5-7 subheadings.
    - Large (2,500+ words): Cornerstone Content, 8+ subheadings.
- Point of View (POV): Maintain the selected person (1st Singular, 1st Plural, 2nd, or 3rd) consistently.

III. MEDIA FINITYHUB (IMAGE LOGIC)
- Quantity (1-6): Distribute exactly the number of images requested by the user across the whole article.
- Placement: Insert an [IMAGE_PLACEHOLDER] tag between sections or within sections where appropriate.
- Prompt Engineering: For each placeholder, provide a hidden technical prompt in a data attribute or comment style like:
  <!-- IMAGE_PROMPT: { "style": "Minimalist", "aspect": "16:9", "alt": "SEO Alt Text", "filename": "seo-optimized-name.jpg", "caption": "Descriptive caption" } -->
- SEO Metadata: Generate a unique Alt Text (with keyphrase), Filename, and Caption.

IV. YOAST SEO & READABILITY STANDARDS
- Sentence Length: At least 75% of sentences must be under 20 words.
- Paragraphs: Maximum 150 words per paragraph.
- Transitions: Use transition words in >30% of sentences.
- Active Voice: Use active voice in >90% of the text.
- Subheadings: Never exceed 300 words without a new H2 or H3.
- Keyphrase: Include the Focus Keyphrase in the SEO Title, Intro (first 100 words), and at least one subheading.`;

export const TONE_OPTIONS = ['Professional', 'Conversational', 'Witty', 'Informative', 'Persuasive'];

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
  'None (General Post)',
  'How-to guide',
  'Listicle',
  'Product review',
  'News',
  'Comparison',
  'Case study',
  'Tutorial',
  'Roundup post',
  'Q&A page'
];

export const ROADMAP_DATA = [
  { step: 'Backend Integration', tech: 'PHP / WP REST API', desc: 'Secure connection to WordPress core for direct draft publication and meta sync.' },
  { step: 'Internal Linking', tech: 'Vector Search', desc: 'Automated internal link suggestions based on existing WordPress content clusters.' },
  { step: 'Asset Engine', tech: 'Gemini 2.5 Flash', desc: 'Automated featured image and alt-text generation based on article focus.' }
];
