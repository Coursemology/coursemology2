import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import DuplicationLayout from 'course/duplication/containers/DuplicationLayout';
import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import storeCreator from './store';

$(() => {
  const mountNode = document.getElementById('app-root');

  if (mountNode) {
    const store = storeCreator({ duplication: {} });
    const root = createRoot(mountNode);

    root.render(
      <ProviderWrapper store={store}>
        <BrowserRouter>
          <DuplicationLayout />
        </BrowserRouter>
      </ProviderWrapper>,
    );
  }
});
