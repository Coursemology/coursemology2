import { render } from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';
import configureStore from './store';

import AnnouncementsIndex from './pages/AnnouncementsIndex';

$(() => {
  const mountNode = document.getElementById('announcements-component');

  if (mountNode) {
    const store = configureStore();

    render(
      <ProviderWrapper {...{ store }}>
        <BrowserRouter>
          <Routes>
            <Route
              path="courses/:courseId/announcements"
              element={<AnnouncementsIndex />}
            />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
      mountNode,
    );
  }
});
