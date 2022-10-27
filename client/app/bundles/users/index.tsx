import { createRoot } from 'react-dom/client';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';
import UserShow from './pages/UserShow';
import configureStore from './store';

$(() => {
  const mountNode = document.getElementById('global-users-component');

  if (mountNode) {
    const store = configureStore();
    const root = createRoot(mountNode);

    root.render(
      <ProviderWrapper store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/users/:userId" element={<UserShow />} />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
    );
  }
});
