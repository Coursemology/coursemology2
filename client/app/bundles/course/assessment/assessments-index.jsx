import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import AssessmentIndexPage from './pages/AssessmentIndex';
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
            element={<AssessmentIndexPage />}
            path="/courses/:courseId/assessments"
          />
        </Routes>
      </BrowserRouter>
    </ProviderWrapper>,
  );
});
