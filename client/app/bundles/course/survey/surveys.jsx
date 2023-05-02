import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import SurveysLayout from './containers/SurveysLayout';
import storeCreator from './store';

$(() => {
  const mountNode = document.getElementById('app-root');

  if (mountNode) {
    const store = storeCreator({ surveys: {} });
    const root = createRoot(mountNode);

    root.render(
      <ProviderWrapper store={store}>
        <BrowserRouter>
          <SurveysLayout />
        </BrowserRouter>
      </ProviderWrapper>,
    );
  }
});
