
import React from 'react';
import htm from 'htm';
import MetadataCard from './MetadataCard.js';
import SectionBlock from './SectionBlock.js';
import CTABlock from './CTABlock.js';
import ImageBlock from './ImageBlock.js';

const html = htm.bind(React.createElement);

const WriterEditor = ({ metadata, sections, ctaContent, setCtaContent, config, generateContentForSection, autoTriggerAllMedia, settings }) => {
  // Map provider ID to enum value
  const getProviderEnum = (providerId) => {
    const mapping = {
      'gemini': 'GEMINI',
      'openai': 'OPENAI',
      'anthropic': 'ANTHROPIC',
      'llama': 'LLAMA'
    };
    return mapping[providerId] || 'GEMINI';
  };

  // Get default model for provider
  const getDefaultModel = (providerId) => {
    const mapping = {
      'gemini': 'gemini-3-pro-preview',
      'openai': 'gpt-4o',
      'anthropic': 'claude-3-5-sonnet-latest',
      'llama': 'llama-3.3-70b-versatile'
    };
    return mapping[providerId] || 'gemini-3-pro-preview';
  };

  const provider = settings?.provider ? getProviderEnum(settings.provider) : 'GEMINI';
  const model = getDefaultModel(settings?.provider || 'gemini');

  return html`
    <div className="flex-1 p-10 space-y-12">
        <div className="max-w-[90%] mx-auto space-y-12">
            <${MetadataCard} metadata=${metadata} manualOverride=${!!settings?.focusKeyphrase} provider=${provider} model=${model} />

            ${sections.length === 0 ? html`
              <div className="h-[400px] flex flex-col items-center justify-center text-slate-200 space-y-6">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center"><i className="fa-solid fa-layer-group text-4xl"></i></div>
                <p className="font-black text-lg text-slate-300">Editor Workspace Idle</p>
              </div>
            ` : html`
              ${metadata?.featuredImage && html`
                <div className="border-b border-slate-100 pb-12 mb-12">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4 block flex items-center">
                    <i className="fa-solid fa-star mr-2"></i> Primary Featured Image
                  </span>
                  <${ImageBlock} 
                    metadata=${metadata.featuredImage} 
                    autoTrigger=${autoTriggerAllMedia} 
                    label="Featured Brand Asset"
                  />
                </div>
              `}

              ${sections.map((section, idx) => html`
                  <${SectionBlock} 
                    key=${idx} 
                    section=${section} 
                    idx=${idx} 
                    isOptimized=${metadata?.focusKeyphrase && section.title.toLowerCase().includes(metadata.focusKeyphrase.toLowerCase())} 
                    onGenerate=${() => generateContentForSection(idx)}
                    autoTriggerAllMedia=${autoTriggerAllMedia}
                    provider=${provider}
                    model=${model}
                  />
              `)}
              
              <${CTABlock} 
                topic=${config.topic}
                keywords=${config.keywords}
                focusKeyphrase=${metadata?.focusKeyphrase || ''}
                existingCTA=${ctaContent}
                onCTAGenerated=${(content) => setCtaContent(content)}
                provider=${provider}
                model=${model}
              />
            `}
        </div>
    </div>
  `;
};

export default WriterEditor;
