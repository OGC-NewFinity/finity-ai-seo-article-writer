
import React from 'react';
import htm from 'htm';
import FeedbackWidget from '@/components/common/FeedbackWidget.js';

const html = htm.bind(React.createElement);

const MetadataCard = ({ metadata, manualOverride, provider, model }) => {
  if (!metadata) return null;

  return html`
    <div className="bg-slate-50/50 p-10 rounded-3xl border border-slate-100 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-3">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Focus Keyphrase</label>
              <div className="text-xl font-black text-slate-800 flex items-center">
                ${metadata.focusKeyphrase}
                ${manualOverride && html`
                  <span className="ml-3 text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded font-black uppercase tracking-tighter">Manual Override</span>
                `}
              </div>
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
      ${provider && html`
        <div className="mt-6 pt-6 border-t border-slate-200">
          <${FeedbackWidget}
            contentType="ARTICLE_METADATA"
            provider=${provider}
            model=${model}
            metadata=${{ focusKeyphrase: metadata.focusKeyphrase, seoTitle: metadata.seoTitle }}
            variant="stars"
            showComment=${true}
          />
        </div>
      `}
    </div>
  `;
};

export default MetadataCard;
