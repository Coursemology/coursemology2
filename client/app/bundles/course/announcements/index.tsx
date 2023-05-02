import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import AnnouncementsIndex from './pages/AnnouncementsIndex';
import configureStore from './store';

$(() => {
  const mountNode = document.getElementById('app-root');

  if (mountNode) {
    const store = configureStore();
    const root = createRoot(mountNode);

    root.render(
      <ProviderWrapper store={store}>
        <BrowserRouter>
          <Routes>
            <Route
              element={<AnnouncementsIndex />}
              path="courses/:courseId/announcements"
            />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
    );
  }
});
