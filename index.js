import React from 'react';
import { createRoot } from 'react-dom/client';
import htm from 'htm';
import App from './App.js';
import './styles.css';

const html = htm.bind(React.createElement);

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    html`<${React.StrictMode}>
      <${App} />
    <//>`
  );
}