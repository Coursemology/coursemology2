import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from 'App';

import SubmissionsIndex from './pages/SubmissionsIndex/index';

$(() => {
  const mountNode = document.getElementById('app-root');

  if (mountNode) {
    const root = createRoot(mountNode);

    root.render(
      <App>
        <BrowserRouter>
          <Routes>
            <Route
              element={<SubmissionsIndex />}
              path="/courses/:courseId/assessments/submissions"
            />
          </Routes>
        </BrowserRouter>
      </App>,
    );
  }
});
