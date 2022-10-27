import { createRoot } from 'react-dom/client';

import { BrowserRouter } from 'react-router-dom';
import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';
import DuplicationLayout from 'course/duplication/containers/DuplicationLayout';
import storeCreator from './store';

$(() => {
  const mountNode = document.getElementById('course-duplication');

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
