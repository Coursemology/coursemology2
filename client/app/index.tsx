import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './initializers';

import RoutedApp from './RoutedApp';
import 'theme/index.css';

$(() => {
  const node = document.getElementById('app-root');
  if (!node) return;

  const root = createRoot(node);

  root.render(
    <StrictMode>
      <RoutedApp />
    </StrictMode>,
  );
});
