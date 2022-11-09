import { render } from 'react-dom';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ScrollToTop from 'lib/components/navigation/ScrollToTop';
import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import ForumShow from './pages/ForumShow';
import ForumsIndex from './pages/ForumsIndex';
import ForumTopicShow from './pages/ForumTopicShow';
import { store } from './store';

$(() => {
  const mountNode = document.getElementById('course-forum-component');

  if (mountNode) {
    render(
      <ProviderWrapper store={store}>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route element={<ForumsIndex />} path="courses/:courseId/forums" />
            <Route
              element={<ForumShow />}
              path="courses/:courseId/forums/:forumId"
            />
            <Route
              element={<ForumTopicShow />}
              path="courses/:courseId/forums/:forumId/topics/:topicId"
            />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
      mountNode,
    );
  }
});
