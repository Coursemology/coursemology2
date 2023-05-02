import { createRoot } from 'react-dom/client';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import ScribingQuestion from './scribing/ScribingQuestion';
import storeCreator from './scribing/store';

$(() => {
  const mountNode = document.getElementById('app-root');

  if (mountNode) {
    const store = storeCreator({ scribingQuestion: {} });
    const root = createRoot(mountNode);

    root.render(
      <ProviderWrapper store={store}>
        <ScribingQuestion />
      </ProviderWrapper>,
    );
  }
});
