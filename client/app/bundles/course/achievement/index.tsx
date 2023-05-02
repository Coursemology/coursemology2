import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import AchievementShow from './pages/AchievementShow';
import AchievementsIndex from './pages/AchievementsIndex';
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
              element={<AchievementsIndex />}
              path="/courses/:courseId/achievements/"
            />
            <Route
              element={<AchievementShow />}
              path="/courses/:courseId/achievements/:achievementId"
            />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
    );
  }
});
