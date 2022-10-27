import { createRoot } from 'react-dom/client';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import configureStore from './store';
import SubmissionsIndex from './pages/SubmissionsIndex/index';

$(() => {
  const mountNode = document.getElementById('course-submissions-component');

  if (mountNode) {
    const store = configureStore();
    const root = createRoot(mountNode);

    root.render(
      <ProviderWrapper store={store}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/courses/:courseId/assessments/submissions"
              element={<SubmissionsIndex />}
            />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
    );
  }
});
