
import React, { useState, useRef, useEffect } from 'react';
import htm from 'htm';
import { TONE_OPTIONS, LANGUAGE_OPTIONS, ARTICLE_TYPE_OPTIONS, ARTICLE_SIZE_OPTIONS, POV_OPTIONS, IMAGE_QUANTITY_OPTIONS } from '../constants.js';
import { generateOutline, generateSection, analyzeSEO, generateMetadata } from '../services/geminiService.js';

const html = htm.bind(React.createElement);

const CustomDropdown = ({ label, options, value, onChange, type = 'text' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = type === 'language' 
    ? LANGUAGE_OPTIONS.find(l => l.label === value) 
    : options.find(o => o === value);

  return html`
    <div className="relative" ref=${dropdownRef}>
      <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-widest">${label}</label>
      <button
        type="button"
        onClick=${() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-900 text-white border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:outline-none text-left transition-all hover:bg-slate-800 shadow-sm"
      >
        <span className="flex items-center">
          ${type === 'language' && selectedOption && html`
            <span className="mr-3 text-lg leading-none filter drop-shadow-sm">${selectedOption.flag}</span>
          `}
          <span className="truncate font-bold text-sm tracking-tight">${type === 'language' ? selectedOption?.label : selectedOption}</span>
        </span>
        <i className=${`fa-solid fa-chevron-down text-[10px] text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      ${isOpen && html`
        <div className="absolute z-[100] mt-2 w-full bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-dropdownIn backdrop-blur-xl">
          <div className="max-h-64 overflow-y-auto custom-scrollbar py-2">
            ${options.map((opt, idx) => {
              const isSelected = type === 'language' ? opt.label === value : opt === value;
              const displayLabel = type === 'language' ? opt.label : opt;
              const flag = type === 'language' ? opt.flag : null;

              return html`
                <button
                  key=${idx}
                  type="button"
                  onClick=${() => {
                    onChange(type === 'language' ? opt.label : opt);
                    setIsOpen(false);
                  }}
                  className=${`w-full flex items-center px-4 py-3.5 text-sm text-left transition-all ${
                    isSelected 
                      ? 'bg-blue-600 text-white font-black' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  ${type === 'language' && html`
                    <span className="mr-3 text-lg leading-none w-7 text-center">${flag}</span>
                  `}
                  <span className="flex-1 font-bold">${displayLabel}</span>
                  ${isSelected && html`<i className="fa-solid fa-check ml-2 text-[10px]"></i>`}
                </button>
              `;
            })}
          </div>
        </div>
      `}
    </div>
  `;
};

const Writer = () => {
  const [config, setConfig] = useState({
    topic: '',
    keywords: [],
    tone: 'Professional',
    language: 'English (US)',
    articleType: 'None (General Post)',
    articleSize: 'Medium (1,200-1,800 words)',
    pov: 'None (Neutral/Mix)',
    imageQuantity: '2'
  });
  
  const [metadata, setMetadata] = useState(null);
  const [sections, setSections] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');

  const addKeyword = () => {
    if (keywordInput.trim() && !config.keywords.includes(keywordInput.trim())) {
      setConfig(prev => ({ ...prev, keywords: [...prev.keywords, keywordInput.trim()] }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (kw) => {
    setConfig(prev => ({ ...prev, keywords: prev.keywords.filter(k => k !== kw) }));
  };

  const handleStartGeneration = async () => {
    if (!config.topic) return;
    setLoading(true);
    try {
      const meta = await generateMetadata(config.topic, config.keywords, config.articleType, config.language, config.articleSize, config.pov);
      setMetadata(meta);

      const outline = await generateOutline(config.topic, [meta.focusKeyphrase, ...config.keywords], config.articleType, config.language, config.articleSize, config.pov);
      const initialSections = outline.map((title) => ({
        title,
        body: '',
        isGenerating: false
      }));
      setSections(initialSections);
    } catch (e) {
      console.error(e);
      alert("Error generating content plan.");
    } finally {
      setLoading(false);
    }
  };

  const generateContentForSection = async (index) => {
    const section = sections[index];
    setSections(prev => prev.map((s, i) => i === index ? { ...s, isGenerating: true } : s));
    
    try {
      const focusKw = metadata?.focusKeyphrase || '';
      const content = await generateSection(
        section.title, 
        config.topic, 
        [focusKw, ...config.keywords], 
        config.tone,
        config.articleType,
        config.language,
        config.articleSize,
        config.pov,
        config.imageQuantity
      );
      setSections(prev => prev.map((s, i) => i === index ? { ...s, body: content || '', isGenerating: false } : s));
    } catch (e) {
      console.error(e);
      setSections(prev => prev.map((s, i) => i === index ? { ...s, isGenerating: false } : s));
    }
  };

  const runSEOAnalysis = async () => {
    const fullText = sections.map(s => `<h2>${s.title}</h2>${s.body}`).join('\n');
    setLoading(true);
    const result = await analyzeSEO(fullText, [metadata?.focusKeyphrase || '', ...config.keywords]);
    setAnalysis(result);
    setLoading(false);
  };

  const inputClass = "w-full px-4 py-3 bg-slate-900 text-white border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:outline-none placeholder-slate-500 font-bold transition-all shadow-sm text-sm tracking-tight";

  return html`
    <div className="max-w-[95%] mx-auto space-y-12 animate-fadeIn py-6">
      <!-- Post Configuration (Top Layer) -->
      <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-black flex items-center text-slate-800 uppercase tracking-widest">
                <i className="fa-solid fa-sliders text-blue-600 mr-2"></i>
                Post Configuration
            </h3>
            <div className="flex space-x-2">
                <span className="text-[10px] bg-slate-50 px-3 py-1 rounded-lg text-slate-400 font-black uppercase tracking-widest">WP Draft Sync: Active</span>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="col-span-1 lg:col-span-2">
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1 tracking-widest">Target Topic</label>
              <input 
                type="text" 
                className=${inputClass}
                placeholder="Enter article topic..."
                value=${config.topic}
                onChange=${e => setConfig({ ...config, topic: e.target.value })}
              />
            </div>

            <div className="col-span-1 lg:col-span-2">
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-1 tracking-widest">Primary Keywords</label>
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  className=${inputClass}
                  placeholder="Comma separated or enter..."
                  value=${keywordInput}
                  onChange=${e => setKeywordInput(e.target.value)}
                  onKeyDown=${e => e.key === 'Enter' && addKeyword()}
                />
                <button onClick=${addKeyword} className="px-5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/10">
                  <i className="fa-solid fa-plus"></i>
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                ${config.keywords.map(kw => html`
                  <span key=${kw} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-[10px] font-black border border-blue-100 flex items-center transition-all hover:bg-blue-100">
                    ${kw}
                    <button onClick=${() => removeKeyword(kw)} className="ml-2 text-blue-400 hover:text-red-500">
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                  </span>
                `)}
              </div>
            </div>

            <${CustomDropdown} 
              label="Article Type"
              options=${ARTICLE_TYPE_OPTIONS}
              value=${config.articleType}
              onChange=${(val) => setConfig({ ...config, articleType: val })}
            />

            <${CustomDropdown} 
              label="Article Size"
              options=${ARTICLE_SIZE_OPTIONS}
              value=${config.articleSize}
              onChange=${(val) => setConfig({ ...config, articleSize: val })}
            />

            <${CustomDropdown} 
              label="Narrative POV"
              options=${POV_OPTIONS}
              value=${config.pov}
              onChange=${(val) => setConfig({ ...config, pov: val })}
            />

            <${CustomDropdown} 
                label="Language"
                options=${LANGUAGE_OPTIONS}
                value=${config.language}
                onChange=${(val) => setConfig({ ...config, language: val })}
                type="language"
            />

            <${CustomDropdown} 
                label="Image Quantity"
                options=${IMAGE_QUANTITY_OPTIONS}
                value=${config.imageQuantity}
                onChange=${(val) => setConfig({ ...config, imageQuantity: val })}
            />
        </div>

        <div className="mt-8 flex justify-end items-center space-x-6">
            <div className="flex flex-col items-end mr-4">
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Estimated Velocity</span>
                <span className="text-xs font-bold text-slate-700">~2,400 tokens / 4s</span>
            </div>
            <button 
                disabled=${loading || !config.topic}
                onClick=${handleStartGeneration}
                className="px-10 py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95"
            >
                ${loading ? html`<i className="fa-solid fa-spinner fa-spin mr-2"></i>` : html`<i className="fa-solid fa-wand-magic-sparkles mr-2"></i>`}
                Initialize Agent & Build Plan
            </button>
        </div>
      </section>

      <!-- Editor Workspace (Bottom Layer) -->
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[800px]">
        <div className="bg-slate-900 px-8 py-5 flex justify-between items-center">
            <h3 className="font-black text-white text-xs uppercase tracking-widest flex items-center">
                <i className="fa-solid fa-newspaper mr-3 text-blue-500"></i>
                Editor Workspace
            </h3>
            <div className="flex space-x-3">
              <button onClick=${runSEOAnalysis} className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-emerald-500/10">
                SEO Audit
              </button>
              <button onClick=${() => alert("Draft synced to WP Context...")} className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-500/10">
                Push to WordPress
              </button>
            </div>
        </div>

        <div className="flex-1 p-10 space-y-12">
            <!-- Workspace Content Area (Max Width 90% for readability) -->
            <div className="max-w-[90%] mx-auto space-y-12">
                ${metadata && html`
                  <div className="bg-slate-50/50 p-10 rounded-3xl border border-slate-100 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-3">
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Focus Keyphrase</label>
                            <div className="text-xl font-black text-slate-800">${metadata.focusKeyphrase}</div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Slug</label>
                            <code className="text-[11px] font-bold text-blue-600 bg-white px-3 py-2 rounded-lg border border-slate-200 block truncate">${metadata.slug}</code>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">SEO Title</label>
                            <div className="text-sm font-bold text-slate-700 truncate">${metadata.seoTitle}</div>
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Meta Description</label>
                            <p className="text-xs font-medium text-slate-500 leading-relaxed">${metadata.metaDescription}</p>
                        </div>
                    </div>
                  </div>
                `}

                ${sections.length === 0 ? html`
                  <div className="h-[400px] flex flex-col items-center justify-center text-slate-200 space-y-6">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center">
                        <i className="fa-solid fa-layer-group text-4xl"></i>
                    </div>
                    <div className="text-center">
                        <p className="font-black text-lg text-slate-300">Editor Workspace Idle</p>
                        <p className="text-xs text-slate-400 font-medium">Configure and initialize to start writing</p>
                    </div>
                  </div>
                ` : sections.map((section, idx) => html`
                    <div key=${idx} className="group relative bg-white rounded-2xl p-8 border border-slate-50 hover:border-blue-100 transition-all shadow-sm hover:shadow-md">
                      <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-50">
                        <div className="flex items-center space-x-4">
                            <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">
                                ${idx + 1}
                            </span>
                            <h4 className="text-2xl font-black text-slate-800 tracking-tight">
                              ${section.title}
                            </h4>
                        </div>
                        ${!section.body && !section.isGenerating && html`
                          <button 
                            onClick=${() => generateContentForSection(idx)}
                            className="text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-500/10"
                          >
                            Generate Block
                          </button>
                        `}
                        ${section.body && html`
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center">
                                <i className="fa-solid fa-check-circle mr-2"></i> Generated
                            </span>
                        `}
                      </div>
                      
                      ${section.isGenerating ? html`
                        <div className="animate-pulse space-y-6 py-4">
                          <div className="h-4 bg-slate-50 rounded-full w-full"></div>
                          <div className="h-4 bg-slate-50 rounded-full w-11/12"></div>
                          <div className="h-4 bg-slate-50 rounded-full w-10/12"></div>
                          <div className="h-4 bg-slate-50 rounded-full w-full"></div>
                        </div>
                      ` : html`
                        <div 
                          className="prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed font-medium editor-html-content"
                          dangerouslySetInnerHTML=${{ __html: section.body || '<span class="text-slate-200 italic font-bold">Content block waiting for generation...</span>' }}
                        />
                      `}
                    </div>
                `)}
            </div>
        </div>

        <!-- Sidebar / Contextual Analysis (Floating UI for stacked layout) -->
        ${analysis && html`
          <div className="fixed bottom-10 right-10 w-80 bg-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-700 animate-fadeIn z-[100]">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contextual Audit</h3>
                <button onClick=${() => setAnalysis(null)} className="text-slate-500 hover:text-white transition-colors">
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>
            
            <div className="flex items-center justify-between mb-8">
                <div className="text-3xl font-black text-white">${analysis.score}%</div>
                <div className=${`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${analysis.score > 70 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                    ${analysis.score > 70 ? 'Excellent' : 'Needs Optimization'}
                </div>
            </div>

            <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
              <div className="flex justify-between text-[10px] text-slate-500 font-black uppercase tracking-widest">
                <span>Readability Grade</span>
                <span className="text-blue-400">${analysis.readability}</span>
              </div>
              <ul className="space-y-4 mt-6">
                ${analysis.suggestions.map((s, i) => html`
                  <li key=${i} className="text-[11px] flex items-start text-slate-300 font-bold leading-relaxed">
                    <i className="fa-solid fa-lightbulb text-blue-500 mt-1 mr-3 shrink-0"></i>
                    ${s}
                  </li>
                `)}
              </ul>
            </div>
          </div>
        `}
      </section>
    </div>
  `;
};

export default Writer;
