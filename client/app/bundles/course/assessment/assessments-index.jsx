import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import AssessmentEdit from './pages/AssessmentEdit';
import AssessmentShow from './pages/AssessmentShow';
import AssessmentsIndex from './pages/AssessmentsIndex';
import AssessmentStatisticsPage from './pages/AssessmentStatistics';
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
          <Route
            element={<AssessmentEdit />}
            path="/courses/:courseId/assessments/:assessmentId/edit"
          />
          <Route
            element={<AssessmentStatisticsPage />}
            path="/courses/:courseId/assessments/:assessmentId/statistics"
          />
        </Routes>
      </BrowserRouter>
    </ProviderWrapper>,
  );
});
