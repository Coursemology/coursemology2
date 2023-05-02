import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { enableMapSet } from 'immer';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import EditTextResponsePage from './text-responses/EditTextResponsePage';
import NewTextResponsePage from './text-responses/NewTextResponsePage';

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
            element={<NewTextResponsePage />}
            path="courses/:courseId/assessments/:assessmentId/question/text_responses/new"
          />
          <Route
            element={<EditTextResponsePage />}
            path="/courses/:courseId/assessments/:assessmentId/question/text_responses/:questionId/edit"
          />
        </Routes>
      </BrowserRouter>
    </ProviderWrapper>,
  );
});
