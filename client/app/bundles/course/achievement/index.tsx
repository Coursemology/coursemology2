import { createRoot } from 'react-dom/client';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';
import AchievementEdit from './pages/AchievementEdit';
import AchievementsIndex from './pages/AchievementsIndex';
import AchievementShow from './pages/AchievementShow';
import configureStore from './store';

$(() => {
  const mountNode = document.getElementById('course-achievement-component');

  if (mountNode) {
    const store = configureStore();
    const root = createRoot(mountNode);

    root.render(
      <ProviderWrapper store={store}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/courses/:courseId/achievements/"
              element={<AchievementsIndex />}
            />
            <Route
              path="/courses/:courseId/achievements/:achievementId"
              element={<AchievementShow />}
            />
            <Route
              path="/courses/:courseId/achievements/:achievementId/edit"
              element={<AchievementEdit />}
            />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
    );
  }
});
