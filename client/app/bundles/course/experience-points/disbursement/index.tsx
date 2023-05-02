import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from 'App';

import DisbursementIndex from './pages/DisbursementIndex';

$(() => {
  const mountNode = document.getElementById('app-root');

  if (mountNode) {
    const root = createRoot(mountNode);

    root.render(
      <App>
        <BrowserRouter>
          <Routes>
            <Route
              element={<DisbursementIndex />}
              path="/courses/:courseId/users/disburse_experience_points"
            />
          </Routes>
        </BrowserRouter>
      </App>,
    );
  }
});
