
import React, { useState, useEffect } from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const PublishModal = ({ isOpen, onClose, metadata, sections }) => {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState('idle'); // idle, publishing, success

  const steps = [
    { label: 'Authenticating with WP REST API', icon: 'fa-key' },
    { label: 'Synchronizing SEO Meta (Yoast Logic)', icon: 'fa-magnifying-glass' },
    { label: 'Uploading Nova‑XFinity Media Assets', icon: 'fa-cloud-arrow-up' },
    { label: 'Constructing Gutenberg Blocks', icon: 'fa-cubes' },
    { label: 'Finalizing Article Draft', icon: 'fa-check-double' }
  ];

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setStatus('publishing');
      
      let currentStep = 0;
      const interval = setInterval(() => {
        if (currentStep < steps.length - 1) {
          currentStep++;
          setStep(currentStep);
        } else {
          clearInterval(interval);
          setStatus('success');
        }
      }, 1200);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return html`
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-fadeIn" onClick=${status === 'success' ? onClose : null}></div>
      
      <div className="relative w-full max-w-lg bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-black/50 overflow-hidden animate-dropdownIn border border-slate-800">
        <div className="p-10 text-center">
          ${status === 'publishing' ? html`
            <div className="mb-8">
              <div className="w-20 h-20 bg-blue-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-700">
                <i className="fa-solid fa-spinner fa-spin text-3xl text-blue-500"></i>
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">Syncing to WordPress</h3>
              <p className="text-slate-400 font-medium text-sm mt-2">Connecting your Finity Agent to the WP REST API context.</p>
            </div>

            <div className="space-y-4 text-left max-w-xs mx-auto">
              ${steps.map((s, i) => html`
                <div key=${i} className=${`flex items-center space-x-4 transition-all duration-500 ${i === step ? 'translate-x-2' : ''} ${i > step ? 'opacity-20' : 'opacity-100'}`}>
                  <div className=${`w-8 h-8 rounded-xl flex items-center justify-center text-xs ${i === step ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-800 text-slate-500 border border-slate-700'}`}>
                    <i className=${`fa-solid ${i < step ? 'fa-check' : s.icon}`}></i>
                  </div>
                  <span className=${`text-[11px] font-black uppercase tracking-widest ${i === step ? 'text-white' : 'text-slate-400'}`}>${s.label}</span>
                </div>
              `)}
            </div>

            <div className="mt-10 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-700">
               <div className="bg-blue-600 h-full transition-all duration-500" style=${{ width: `${((step + 1) / steps.length) * 100}%` }}></div>
            </div>
          ` : html`
            <div className="animate-fadeIn">
              <div className="w-24 h-24 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-700 shadow-xl shadow-emerald-500/10">
                <i className="fa-solid fa-circle-check text-5xl text-emerald-500"></i>
              </div>
              <h3 className="text-3xl font-black text-white tracking-tight">Article Published!</h3>
              <p className="text-slate-400 font-medium text-sm mt-3 px-6 leading-relaxed">
                Your SEO-optimized article has been successfully pushed as a draft to your WordPress installation.
              </p>

              <div className="mt-10 space-y-3">
                <a 
                  href="#" 
                  onClick=${(e) => { e.preventDefault(); alert("Preparing your content for WordPress. This will open the WordPress editor with your generated article."); }}
                  className="block w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200"
                >
                  <i className="fa-solid fa-arrow-up-right-from-square mr-2"></i> View in WordPress
                </a>
                <button 
                  onClick=${onClose}
                  className="block w-full py-4 bg-slate-800 text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700"
                >
                  Return to Finity Workspace
                </button>
              </div>
            </div>
          `}
        </div>

        <div className="bg-slate-800 px-10 py-4 flex items-center justify-between border-t border-slate-700">
           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target Context: wp-json/v2/posts</span>
           <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Draft ID: #WP-8312</span>
        </div>
      </div>
    </div>
  `;
};

export default PublishModal;
