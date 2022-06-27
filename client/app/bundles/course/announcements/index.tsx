import { render } from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import configureStore from './store';

// import AnnouncementEdit from './pages/AnnouncementEdit';
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
            {/* <Route
              path="courses/:courseId/announcements/:announcementId/edit"
              element={<AnnouncementEdit />}
            /> */}
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
      mountNode,
    );
  }
});
