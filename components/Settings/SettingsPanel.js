import React from 'react';
import htm from 'htm';
import { PROVIDER_OPTIONS } from '../../constants.js';
import OnboardingBanner from '../common/OnboardingBanner.js';
import Tooltip from '../common/Tooltip.js';

const html = htm.bind(React.createElement);

const SettingsPanel = ({ settings, onSettingsChange, onSave }) => {
  return html`
    <div className="bg-slate-900 p-12 rounded-[2.5rem] border border-slate-800 max-w-3xl mx-auto animate-fadeIn shadow-xl shadow-black/50">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black mb-2 text-white tracking-tight">Agent Infrastructure</h2>
        <p className="text-slate-400 font-medium">Select your primary engine and manage enterprise API keys.</p>
      </div>
      
      <${OnboardingBanner}
        id="settings-welcome"
        title="Welcome to Settings!"
        message="Configure your AI provider, API keys, and global settings. Google Gemini is enabled by default. Add API keys for other providers to unlock their features."
        icon="fa-sliders"
        type="info"
      />
      
      <div className="space-y-10">
        <!-- Provider Selector -->
        <div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Active Service Provider</label>
            <${Tooltip} text="Choose your primary AI provider. Google Gemini is enabled by default. Select other providers and add API keys to use their models." position="bottom">
              <i className="fa-solid fa-circle-question text-slate-500 text-xs cursor-help hover:text-blue-400 transition-colors"></i>
            </${Tooltip}>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            ${PROVIDER_OPTIONS.map(p => html`
              <button 
                key=${p.id}
                onClick=${() => onSettingsChange({...settings, provider: p.id})}
                className=${`p-5 rounded-2xl border-2 transition-all flex flex-col items-center group relative overflow-hidden ${settings.provider === p.id ? 'border-blue-600 bg-blue-900/30' : 'border-slate-700 hover:border-slate-600 bg-slate-800'}`}
              >
                <i className=${`fa-solid ${p.icon} text-2xl mb-3 ${settings.provider === p.id ? 'text-blue-600' : 'text-slate-300 group-hover:text-slate-400'}`}></i>
                <span className=${`text-[9px] font-black uppercase tracking-tight ${settings.provider === p.id ? 'text-blue-500' : 'text-slate-400'}`}>${p.label}</span>
                <span className="mt-1 text-[7px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">${p.badge}</span>
              </button>
            `)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-800">
           <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Google Gemini (Default)</label>
                <${Tooltip} text="Google Gemini is enabled by default and doesn't require an API key. It's integrated natively with the system." position="top">
                  <i className="fa-solid fa-circle-question text-slate-500 text-xs cursor-help hover:text-blue-400 transition-colors"></i>
                </${Tooltip}>
              </div>
              <div className="relative">
                <input type="text" readOnly value="Native Context System" className="w-full px-5 py-4 bg-slate-800 border border-slate-700 rounded-2xl text-xs font-bold text-slate-400 shadow-inner" />
                <i className="fa-solid fa-check-circle absolute right-5 top-1/2 -translate-y-1/2 text-emerald-500"></i>
              </div>
           </div>

           <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">OpenAI API Key</label>
                <${Tooltip} text="Enter your OpenAI API key (starts with 'sk-') to enable GPT models. Get your key from platform.openai.com" position="top">
                  <i className="fa-solid fa-circle-question text-slate-500 text-xs cursor-help hover:text-blue-400 transition-colors"></i>
                </${Tooltip}>
              </div>
              <input type="password" value=${settings.openaiKey || ''} onChange=${e => onSettingsChange({...settings, openaiKey: e.target.value})} placeholder="sk-..." className="w-full px-5 py-4 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-900/50 font-mono text-xs shadow-sm text-white placeholder-slate-500" />
           </div>

           <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Anthropic Claude Key</label>
                <${Tooltip} text="Enter your Anthropic Claude API key (starts with 'sk-ant-') to enable Claude models. Get your key from console.anthropic.com" position="top">
                  <i className="fa-solid fa-circle-question text-slate-500 text-xs cursor-help hover:text-blue-400 transition-colors"></i>
                </${Tooltip}>
              </div>
              <input type="password" value=${settings.claudeKey || ''} onChange=${e => onSettingsChange({...settings, claudeKey: e.target.value})} placeholder="sk-ant-..." className="w-full px-5 py-4 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-900/50 font-mono text-xs shadow-sm text-white placeholder-slate-500" />
           </div>

           <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Groq / Llama API Key</label>
                <${Tooltip} text="Enter your Groq API key (starts with 'gsk_') to enable fast Llama inference. Get your key from console.groq.com" position="top">
                  <i className="fa-solid fa-circle-question text-slate-500 text-xs cursor-help hover:text-blue-400 transition-colors"></i>
                </${Tooltip}>
              </div>
              <input type="password" value=${settings.llamaKey || ''} onChange=${e => onSettingsChange({...settings, llamaKey: e.target.value})} placeholder="gsk_..." className="w-full px-5 py-4 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-900/50 font-mono text-xs shadow-sm text-white placeholder-slate-500" />
           </div>
        </div>

        <div className="pt-6 border-t border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Manual Global Focus Keyphrase</label>
            <${Tooltip} text="Set a default SEO focus keyphrase that will be used across all generated content. Leave empty to let the AI generate context-appropriate keyphrases." position="top">
              <i className="fa-solid fa-circle-question text-slate-500 text-xs cursor-help hover:text-blue-400 transition-colors"></i>
            </${Tooltip}>
          </div>
          <input type="text" placeholder="e.g., Enterprise WordPress SEO, React Best Practices, AI Content Generation" value=${settings.focusKeyphrase || ''} onChange=${e => onSettingsChange({...settings, focusKeyphrase: e.target.value})} className="w-full px-5 py-4 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-900/50 font-bold text-white text-sm outline-none transition-all shadow-sm placeholder-slate-500" />
          <p className="text-[9px] text-slate-500 mt-2 ml-1">💡 Tip: Set a global keyphrase to ensure consistent SEO focus across all generated articles.</p>
        </div>

        <button onClick=${onSave} className="w-full py-5 bg-slate-800 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all active:scale-95 shadow-xl shadow-black/50 border border-slate-700">
           Save Infrastructure Settings
        </button>
      </div>
    </div>
  `;
};

export default SettingsPanel;
