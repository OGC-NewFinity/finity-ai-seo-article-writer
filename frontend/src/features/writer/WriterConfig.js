
import React from 'react';
import htm from 'htm';
import CustomDropdown from '@/components/common/CustomDropdown.js';
import Tooltip from '@/components/common/Tooltip.js';
import OnboardingBanner from '@/components/common/OnboardingBanner.js';
import { 
  TONE_OPTIONS, LANGUAGE_OPTIONS, ARTICLE_TYPE_OPTIONS, ARTICLE_SIZE_OPTIONS, 
  POV_OPTIONS, IMAGE_QUANTITY_OPTIONS, ASPECT_RATIO_OPTIONS, IMAGE_STYLE_OPTIONS,
  CATEGORY_OPTIONS, PROVIDER_OPTIONS
} from '@/constants.js';

const html = htm.bind(React.createElement);

const WriterConfig = ({ config, setConfig, keywordInput, setKeywordInput, processKeywords, handleStartGeneration, loading, autosavePulse, startNewArticle, settings }) => {
  const activeProvider = PROVIDER_OPTIONS.find(p => p.id === settings.provider) || PROVIDER_OPTIONS[0];
  const inputClass = "w-full px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:outline-none placeholder-slate-500 font-bold transition-all shadow-sm text-sm tracking-tight";

  return html`
    <section className="bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-800">
      <${OnboardingBanner}
        id="writer-welcome"
        title="Welcome to SEO Writer!"
        message="Start by entering your topic and keywords. Configure your article settings, then click 'Initialize Agent' to generate an SEO-optimized article structure. Each section can be generated individually."
        icon="fa-newspaper"
        type="info"
      />
      
      <div className="flex items-center justify-between mb-8">
          <h3 className="text-sm font-black flex items-center text-white uppercase tracking-widest">
              <i className="fa-solid fa-sliders text-blue-600 mr-2"></i> Post Configuration
          </h3>
          <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 px-4 py-1.5 rounded-full">
                <i className=${`fa-solid ${activeProvider.icon} text-blue-500 text-[10px]`}></i>
                <span className="text-[10px] font-black text-slate-200 uppercase tracking-tight">${activeProvider.label}</span>
              </div>
              ${autosavePulse && html`<span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center animate-pulse"><i className="fa-solid fa-floppy-disk mr-2"></i> Draft Saved</span>`}
          </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Topic</label>
              <${Tooltip} text="Enter the main subject of your article. This will be used to generate the outline, metadata, and content sections." position="top">
                <i className="fa-solid fa-circle-question text-slate-500 text-xs cursor-help hover:text-blue-400 transition-colors"></i>
              </${Tooltip}>
            </div>
            <input type="text" className=${inputClass} placeholder="e.g., 'Advanced React Patterns for Enterprise Applications'" value=${config.topic} onChange=${e => setConfig({ ...config, topic: e.target.value })} />
          </div>
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Primary Keywords</label>
              <${Tooltip} text="Add SEO keywords separated by commas. These help optimize your article for search engines. Focus on 3-5 main keywords." position="top">
                <i className="fa-solid fa-circle-question text-slate-500 text-xs cursor-help hover:text-blue-400 transition-colors"></i>
              </${Tooltip}>
            </div>
            <div className="flex space-x-2">
              <input type="text" className=${inputClass} placeholder="react, enterprise, patterns, best practices" value=${keywordInput} onChange=${e => e.target.value.includes(',') ? processKeywords(e.target.value) : setKeywordInput(e.target.value)} onKeyDown=${e => e.key === 'Enter' && processKeywords(keywordInput)} />
              <button onClick=${() => processKeywords(keywordInput)} className="px-5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/10"><i className="fa-solid fa-plus"></i></button>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              ${config.keywords.map(kw => html`<span key=${kw} className="bg-blue-900/30 border border-blue-700 text-blue-300 px-3 py-1.5 rounded-lg text-[10px] font-black flex items-center transition-all hover:bg-blue-900/50">${kw}<button onClick=${() => setConfig({ ...config, keywords: config.keywords.filter(k => k !== kw) })} className="ml-2 text-blue-400 hover:text-red-400"><i className="fa-solid fa-xmark"></i></button></span>`)}
            </div>
          </div>

          <div className="col-span-1 lg:col-span-4">
            <div className="flex items-center gap-2 mb-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center">
                 <i className="fa-solid fa-microscope mr-2 text-blue-500"></i> Pulse Mode: Expert Source Context
              </label>
              <${Tooltip} text="Paste technical documentation, RSS feeds, or expert content to enable Senior Technical Journalist mode. This helps the AI generate more accurate, expert-level content." position="top">
                <i className="fa-solid fa-circle-question text-slate-500 text-xs cursor-help hover:text-blue-400 transition-colors"></i>
              </${Tooltip}>
            </div>
            <textarea 
              className=${`${inputClass} h-24 resize-none font-medium leading-relaxed`} 
              placeholder="Paste RSS feed text, technical documentation, or expert notes here to enable enhanced technical writing mode..." 
              value=${config.sourceContext} 
              onChange=${e => setConfig({ ...config, sourceContext: e.target.value })}
            ></textarea>
            <p className="text-[9px] text-slate-500 mt-2 ml-1">💡 Tip: Adding source context improves accuracy and enables advanced technical writing capabilities.</p>
          </div>

          <${CustomDropdown} label="Selected Category" options=${CATEGORY_OPTIONS} value=${config.category} onChange=${v => setConfig({...config, category: v})} />
          <${CustomDropdown} label="Article Type" options=${ARTICLE_TYPE_OPTIONS} value=${config.articleType} onChange=${v => setConfig({...config, articleType: v})} />
          <${CustomDropdown} label="Article Size" options=${ARTICLE_SIZE_OPTIONS} value=${config.articleSize} onChange=${v => setConfig({...config, articleSize: v})} />
          <${CustomDropdown} label="Narrative POV" options=${POV_OPTIONS} value=${config.pov} onChange=${v => setConfig({...config, pov: v})} />
          <${CustomDropdown} label="Language" type="language" options=${LANGUAGE_OPTIONS} value=${config.language} onChange=${v => setConfig({...config, language: v})} />
          <${CustomDropdown} label="Image Quantity" options=${IMAGE_QUANTITY_OPTIONS} value=${config.imageQuantity} onChange=${v => setConfig({...config, imageQuantity: v})} />
          <${CustomDropdown} label="Image Aspect Ratio" options=${ASPECT_RATIO_OPTIONS} value=${config.aspectRatio} onChange=${v => setConfig({...config, aspectRatio: v})} />
          <${CustomDropdown} label="Image Style" options=${IMAGE_STYLE_OPTIONS} value=${config.imageStyle} onChange=${v => setConfig({...config, imageStyle: v})} />
      </div>

      <div className="mt-8 flex justify-end items-center space-x-6">
          <button onClick=${startNewArticle} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-300 mr-auto"><i className="fa-solid fa-trash-can mr-2"></i> Reset Workspace</button>
          <button onClick=${handleStartGeneration} disabled=${loading || !config.topic} className="px-10 py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95">
              ${loading ? html`<i className="fa-solid fa-spinner fa-spin mr-2"></i> Generating...` : html`<i className="fa-solid fa-wand-magic-sparkles mr-2"></i> Initialize Agent`}
          </button>
      </div>
      ${!config.topic && html`
        <div className="mt-6 p-4 bg-slate-800 border border-slate-700 rounded-xl">
          <p className="text-xs text-slate-400 flex items-center">
            <i className="fa-solid fa-lightbulb text-amber-400 mr-2"></i>
            <span>Enter a topic above to begin generating your SEO-optimized article structure.</span>
          </p>
        </div>
      `}
    </section>
  `;
};

export default WriterConfig;
