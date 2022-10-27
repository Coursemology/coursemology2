import { createRoot } from 'react-dom/client';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';
import storeCreator from './scribing/store';
import ScribingQuestion from './scribing/ScribingQuestion';

$(() => {
  const mountNode = document.getElementById('scribing-question');

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
