import { createRoot } from 'react-dom/client';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import configureStore from './store';
import DisbursementIndex from './pages/DisbursementIndex';

$(() => {
  const mountNode = document.getElementById('course-disbursement-component');

  if (mountNode) {
    const store = configureStore();
    const root = createRoot(mountNode);

    root.render(
      <ProviderWrapper store={store}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/courses/:courseId/users/disburse_experience_points"
              element={<DisbursementIndex />}
            />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
    );
  }
});
