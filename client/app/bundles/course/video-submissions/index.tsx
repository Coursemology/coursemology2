import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import UserVideoSubmissionsIndex from './pages/UserVideoSubmissionsIndex';

$(() => {
  const mountNode = document.getElementById('app-root');

  if (mountNode) {
    const root = createRoot(mountNode);

    root.render(
      <ProviderWrapper>
        <BrowserRouter>
          <Routes>
            <Route
              element={<UserVideoSubmissionsIndex />}
              path="/courses/:courseId/users/:userId/video_submissions"
            />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
    );
  }
});
