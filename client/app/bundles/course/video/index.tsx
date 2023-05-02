import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import VideoShow from './pages/VideoShow';
import VideosIndex from './pages/VideosIndex';
import VideoSubmissionEdit from './submission/pages/VideoSubmissionEdit';
import VideoSubmissionShow from './submission/pages/VideoSubmissionShow';
import VideoSubmissionsIndex from './submission/pages/VideoSubmissionsIndex';
import { store } from './store';

$(() => {
  const mountNode = document.getElementById('app-root');

  if (mountNode) {
    const root = createRoot(mountNode);

    root.render(
      <ProviderWrapper store={store}>
        <BrowserRouter>
          <Routes>
            <Route element={<VideosIndex />} path="courses/:courseId/videos" />
            <Route
              element={<VideoShow />}
              path="courses/:courseId/videos/:videoId"
            />
            <Route
              element={<VideoSubmissionsIndex />}
              path="courses/:courseId/videos/:videoId/submissions"
            />
            <Route
              element={<VideoSubmissionShow />}
              path="courses/:courseId/videos/:videoId/submissions/:submissionId"
            />
            <Route
              element={<VideoSubmissionEdit />}
              path="courses/:courseId/videos/:videoId/submissions/:submissionId/edit"
            />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
    );
  }
});
