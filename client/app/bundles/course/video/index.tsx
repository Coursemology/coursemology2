import { render } from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import { store } from './store';
import VideosIndex from './pages/VideosIndex';
import VideoShow from './pages/VideoShow';
import VideoSubmissionsIndex from './submission/pages/VideoSubmissionsIndex';
import VideoSubmissionShow from './submission/pages/VideoSubmissionShow';
import VideoSubmissionEdit from './submission/pages/VideoSubmissionEdit';

$(() => {
  const mountNode = document.getElementById('videos-component');

  if (mountNode) {
    render(
      <ProviderWrapper store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="courses/:courseId/videos" element={<VideosIndex />} />
            <Route
              path="courses/:courseId/videos/:videoId"
              element={<VideoShow />}
            />
            <Route
              path="courses/:courseId/videos/:videoId/submissions"
              element={<VideoSubmissionsIndex />}
            />
            <Route
              path="courses/:courseId/videos/:videoId/submissions/:submissionId"
              element={<VideoSubmissionShow />}
            />
            <Route
              path="courses/:courseId/videos/:videoId/submissions/:submissionId/edit"
              element={<VideoSubmissionEdit />}
            />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
      mountNode,
    );
  }
});
