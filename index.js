
import React from 'react';
import ReactDOM from 'react-dom/client';
import htm from 'htm';
import App from './App.js';

const html = htm.bind(React.createElement);

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    html`<${React.StrictMode}>
      <${App} />
    <//>`
  );
}
