import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { enableMapSet } from 'immer';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import EditForumPostResponsePage from './forum-post-responses/EditForumPostResponsePage';
import NewForumPostResponsePage from './forum-post-responses/NewForumPostResponsePage';

enableMapSet();

$(() => {
  const mountNode = document.getElementById('app-root');
  if (!mountNode) return;

  const root = createRoot(mountNode);
  root.render(
    <ProviderWrapper>
      <BrowserRouter>
        <Routes>
          <Route
            element={<NewForumPostResponsePage />}
            path="courses/:courseId/assessments/:assessmentId/question/forum_post_responses/new"
          />

          <Route
            element={<EditForumPostResponsePage />}
            path="/courses/:courseId/assessments/:assessmentId/question/forum_post_responses/:questionId/edit"
          />
        </Routes>
      </BrowserRouter>
    </ProviderWrapper>,
  );
});
