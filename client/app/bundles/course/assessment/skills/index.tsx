import { createRoot } from 'react-dom/client';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import configureStore from './store';
import SkillsIndex from './pages/SkillsIndex';

$(() => {
  const mountNode = document.getElementById('course-skills-component');

  if (mountNode) {
    const store = configureStore();
    const root = createRoot(mountNode);

    root.render(
      <ProviderWrapper store={store}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/courses/:courseId/assessments/skills"
              element={<SkillsIndex />}
            />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
    );
  }
});
