import { createRoot } from 'react-dom/client';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';
import UserVideoSubmissionsIndex from './pages/UserVideoSubmissionsIndex';

$(() => {
  const mountNode = document.getElementById('video-submissions-component');

  if (mountNode) {
    const root = createRoot(mountNode);

    root.render(
      <ProviderWrapper>
        <BrowserRouter>
          <Routes>
            <Route
              path="/courses/:courseId/users/:userId/video_submissions"
              element={<UserVideoSubmissionsIndex />}
            />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
    );
  }
});
