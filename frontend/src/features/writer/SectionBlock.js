
import React from 'react';
import htm from 'htm';
import ImageBlock from './ImageBlock.js';
import FeedbackWidget from '../../components/common/FeedbackWidget.js';

const html = htm.bind(React.createElement);

const SectionBlock = ({ section, idx, isOptimized, onGenerate, autoTriggerAllMedia, provider, model }) => {
  const renderContent = () => {
    if (!section.body) return html`
      <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30 group/placeholder transition-all hover:bg-slate-50/50">
        <div className="w-14 h-14 rounded-full bg-white border border-slate-100 flex items-center justify-center mb-5 shadow-sm text-slate-200 group-hover/placeholder:text-blue-500 group-hover/placeholder:scale-110 group-hover/placeholder:rotate-6 transition-all duration-500">
          <i className="fa-solid fa-paragraph text-xl"></i>
        </div>
        <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] text-center mb-1">
          Awaiting Generation Engine
        </p>
        <p className="text-[10px] text-slate-400 font-medium text-center max-w-[220px] leading-relaxed">
          Content block waiting for generation... Click 'Generate Block' to invoke the SEO engine.
        </p>
      </div>
    `;

    const parts = section.body.split('[IMAGE_PLACEHOLDER]');
    return html`
      <div className="prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed font-medium editor-html-content">
        ${parts.map((part, i) => html`
          <React.Fragment key=${i}>
            <div dangerouslySetInnerHTML=${{ __html: part }} />
            ${i < parts.length - 1 && html`<${ImageBlock} rawContent=${part} autoTrigger=${autoTriggerAllMedia} />`}
          </React.Fragment>
        `)}
      </div>
    `;
  };

  return html`
    <div className="group relative bg-white rounded-2xl p-8 border border-slate-50 hover:border-blue-100 transition-all shadow-sm hover:shadow-md">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-50">
        <div className="flex items-center space-x-4">
            <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">
                ${idx + 1}
            </span>
            <div className="flex flex-col">
              <h4 className="text-2xl font-black text-slate-800 tracking-tight flex items-center">
                ${section.title}
                ${isOptimized && html`
                  <i className="fa-solid fa-star text-amber-400 ml-3 text-xs" title="SEO Heading Optimized"></i>
                `}
              </h4>
              ${isOptimized && html`
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1">Primary SEO Subheading</span>
              `}
            </div>
        </div>
        ${!section.body && !section.isGenerating && html`
          <button 
            onClick=${onGenerate}
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
        ${renderContent()}
        ${section.body && provider && html`
          <div className="mt-6 pt-6 border-t border-slate-100">
            <${FeedbackWidget}
              contentType="ARTICLE_SECTION"
              provider=${provider}
              model=${model}
              contentId=${section.id || null}
              metadata=${{ sectionTitle: section.title, sectionIndex: idx }}
              variant="stars"
              showComment=${true}
            />
          </div>
        `}
      `}
    </div>
  `;
};

export default SectionBlock;
