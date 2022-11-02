import { render } from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';
import { store } from './store';

import ForumsIndex from './pages/ForumsIndex';
import ForumShow from './pages/ForumShow';
import ForumTopicShow from './pages/ForumTopicShow';

$(() => {
  const mountNode = document.getElementById('course-forum-component');

  if (mountNode) {
    render(
      <ProviderWrapper store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="courses/:courseId/forums" element={<ForumsIndex />} />
            <Route
              path="courses/:courseId/forums/:forumId"
              element={<ForumShow />}
            />
            <Route
              path="courses/:courseId/forums/:forumId/topics/:topicId"
              element={<ForumTopicShow />}
            />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
      mountNode,
    );
  }
});
