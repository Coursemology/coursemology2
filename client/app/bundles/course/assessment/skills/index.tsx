import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import SkillsIndex from './pages/SkillsIndex';
import configureStore from './store';

$(() => {
  const mountNode = document.getElementById('app-root');

  if (mountNode) {
    const store = configureStore();
    const root = createRoot(mountNode);

    root.render(
      <ProviderWrapper store={store}>
        <BrowserRouter>
          <Routes>
            <Route
              element={<SkillsIndex />}
              path="/courses/:courseId/assessments/skills"
            />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
    );
  }
});
