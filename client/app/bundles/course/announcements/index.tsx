import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';
import AnnouncementsIndex from './pages/AnnouncementsIndex';
import configureStore from './store';

$(() => {
  const mountNode = document.getElementById('announcements-component');

  if (mountNode) {
    const store = configureStore();
    const root = createRoot(mountNode);

    root.render(
      <ProviderWrapper store={store}>
        <BrowserRouter>
          <Routes>
            <Route
              path="courses/:courseId/announcements"
              element={<AnnouncementsIndex />}
            />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
    );
  }
});
