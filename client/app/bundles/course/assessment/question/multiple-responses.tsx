import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { enableMapSet } from 'immer';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import EditMcqMrqPage from './multiple-responses/EditMcqMrqPage';
import NewMcqMrqPage from './multiple-responses/NewMcqMrqPage';

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
            element={<NewMcqMrqPage />}
            path="/courses/:courseId/assessments/:assessmentId/question/multiple_responses/new"
          />

          <Route
            element={<EditMcqMrqPage />}
            path="/courses/:courseId/assessments/:assessmentId/question/multiple_responses/:questionId/edit"
          />
        </Routes>
      </BrowserRouter>
    </ProviderWrapper>,
  );
});
