import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import AssessmentShow from './pages/AssessmentShow';

$(() => {
  const mountNode = document.getElementById('course-assessment-show');
  if (!mountNode) return;

  const root = createRoot(mountNode);
  root.render(
    <ProviderWrapper>
      <BrowserRouter>
        <Routes>
          <Route
            element={<AssessmentShow />}
            path="/courses/:courseId/assessments/:assessmentId"
          />
        </Routes>
      </BrowserRouter>
    </ProviderWrapper>,
  );
});
