/* eslint-disable import/no-extraneous-dependencies, import/extensions, import/no-unresolved */

import { createRoot } from 'react-dom/client';

import { BrowserRouter } from 'react-router-dom';
import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';
import store from './store';
import SubmissionsLayout from './containers/SubmissionsLayout';

$(() => {
  const mountNode = document.getElementById('course-assessment-submission');

  if (mountNode) {
    const root = createRoot(mountNode);

    root.render(
      <ProviderWrapper store={store}>
        <BrowserRouter>
          <SubmissionsLayout />
        </BrowserRouter>
      </ProviderWrapper>,
    );
  }
});
