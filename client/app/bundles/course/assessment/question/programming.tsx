import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import EditProgrammingQuestionPage from './programming/EditProgrammingQuestionPage';
import NewProgrammingQuestionPage from './programming/NewProgrammingQuestionPage';

$(() => {
  const mountNode = document.getElementById('programming-question');
  if (!mountNode) return;

  const root = createRoot(mountNode);

  root.render(
    <ProviderWrapper>
      <BrowserRouter>
        <Routes>
          <Route
            element={<NewProgrammingQuestionPage />}
            path="/courses/:courseId/assessments/:assessmentId/question/programming/new"
          />

          <Route
            element={<EditProgrammingQuestionPage />}
            path="/courses/:courseId/assessments/:assessmentId/question/programming/:questionId/edit"
          />
        </Routes>
      </BrowserRouter>
    </ProviderWrapper>,
  );
});
