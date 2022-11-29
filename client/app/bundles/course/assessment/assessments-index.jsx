import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import AssessmentsIndex from './pages/AssessmentsIndex';
import AssessmentShow from './pages/AssessmentShow';
import storeCreator from './store';

$(() => {
  const mountNode = document.getElementById('course-assessments');
  if (!mountNode) return;

  const store = storeCreator({ assessments: {} });
  const root = createRoot(mountNode);
  root.render(
    <ProviderWrapper store={store}>
      <BrowserRouter>
        <Routes>
          <Route
            element={<AssessmentsIndex />}
            path="/courses/:courseId/assessments"
          />

          <Route
            element={<AssessmentShow />}
            path="/courses/:courseId/assessments/:assessmentId"
          />
        </Routes>
      </BrowserRouter>
    </ProviderWrapper>,
  );
});
