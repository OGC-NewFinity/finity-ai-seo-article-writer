import React from 'react';
import htm from 'htm';
import { useNavigate } from 'react-router-dom';

const html = htm.bind(React.createElement);

const MediaHubDashboard = () => {
  const navigate = useNavigate();

  const services = [
    {
      id: 'image-generation',
      title: 'Image Generation',
      description: 'Transform text descriptions into stunning visuals with the Nova‑XFinity AI Agent',
      icon: 'fa-wand-magic-sparkles',
      route: '/media/image-generation',
      bgColor: 'bg-blue-600',
      hoverBgColor: 'hover:bg-blue-700',
      textColor: 'text-blue-600',
      shadowColor: 'shadow-blue-500/20',
      features: ['Text-to-image', 'Style selector', 'Resolution control', 'Seed input']
    },
    {
      id: 'image-editor',
      title: 'Image Editing & Enhancement',
      description: 'Perfect your images with the Nova‑XFinity Media Composer AI-powered editing suite',
      icon: 'fa-paintbrush',
      route: '/media/image-editor',
      bgColor: 'bg-purple-600',
      hoverBgColor: 'hover:bg-purple-700',
      textColor: 'text-purple-600',
      shadowColor: 'shadow-purple-500/20',
      features: ['Upload/edit image', 'Upscale', 'Face restore', 'Color correction', 'Crop']
    },
    {
      id: 'video-generation',
      title: 'Video Generation',
      description: 'Create professional videos with the Nova‑XFinity Engine powered by Veo 3.1',
      icon: 'fa-clapperboard',
      route: '/media/video-generation',
      bgColor: 'bg-green-600',
      hoverBgColor: 'hover:bg-green-700',
      textColor: 'text-green-600',
      shadowColor: 'shadow-green-500/20',
      features: ['Prompt-to-video', 'Script upload', 'Voice selection', 'Preview & render queue']
    }
  ];

  return html`
    <div className="space-y-12 animate-fadeIn pb-20">
      <header className="text-center space-y-4">
        <h2 className="text-4xl font-black text-white tracking-tight">Nova‑XFinity Media Hub</h2>
        <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto">
          Generate high-impact media assets with the Nova‑XFinity Engine powered by Veo 3.1 & Gemini Multimodal AI. Choose a service to begin creating.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        ${services.map(service => html`
          <div 
            key=${service.id}
            className="bg-slate-900 rounded-[2rem] p-8 shadow-sm border border-slate-800 hover:shadow-xl hover:border-blue-600 transition-all cursor-pointer group"
            onClick=${() => navigate(service.route)}
          >
            <div className="flex flex-col h-full">
              <div className=${`w-16 h-16 ${service.bgColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <i className=${`fa-solid ${service.icon} text-2xl text-white`}></i>
              </div>
              
              <h3 className="text-xl font-black text-white mb-2">${service.title}</h3>
              <p className="text-slate-400 text-sm mb-6 flex-grow">${service.description}</p>
              
              <ul className="space-y-2 mb-6">
                ${service.features.map(feature => html`
                  <li key=${feature} className="text-xs text-slate-300 flex items-center">
                    <i className=${`fa-solid fa-check ${service.textColor} mr-2 text-[10px]`}></i>
                    ${feature}
                  </li>
                `)}
              </ul>
              
              <button 
                className=${`w-full py-4 ${service.bgColor} ${service.hoverBgColor} text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg ${service.shadowColor} transition-all active:scale-95 mt-auto`}
                onClick=${(e) => { e.stopPropagation(); navigate(service.route); }}
              >
                <i className=${`fa-solid ${service.icon} mr-2`}></i>
                Start ${service.title.split(' ')[0]}
              </button>
            </div>
          </div>
        `)}
      </div>

      <div className="mt-16 bg-slate-900 rounded-[2rem] p-8 border border-slate-800">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <i className="fa-solid fa-info-circle text-blue-600 text-xl"></i>
          </div>
          <div>
            <h4 className="text-sm font-black text-white mb-2">About Nova‑XFinity Media Services</h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              Each media service is optimized for its specific use case. Image Generation creates stunning visuals from text descriptions using our AI Agent. 
              Image Editing & Enhancement transforms and perfects existing images with our Media Composer. Video Generation produces professional dynamic content 
              with our Smart Synthesizer. All services leverage cutting-edge AI models and support extensive customization options.
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
};

export default MediaHubDashboard;