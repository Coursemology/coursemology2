import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './initializers';

import App from './App';
import 'theme/index.css';

$(() => {
  const node = document.getElementById('app-root');
  if (!node) return;

  const root = createRoot(node);

  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
