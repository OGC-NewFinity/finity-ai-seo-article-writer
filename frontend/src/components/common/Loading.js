import React from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

const Loading = () => {
  return html`
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="text-center">
        <img 
          src="/brand-identity/logo/nova-logo.png" 
          alt="Nova‑XFinity AI Logo" 
          className="w-16 h-16 mx-auto mb-4 animate-pulse"
        />
        <p className="text-slate-400 font-medium">Loading...</p>
      </div>
    </div>
  `;
};

export default Loading;
