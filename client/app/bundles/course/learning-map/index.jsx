import { createRoot } from 'react-dom/client';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';
import LearningMap from './containers/LearningMap';
import storeCreator from './store';

$(() => {
  const mountNode = document.getElementById('course-learning-map');
  const store = storeCreator({ learningMap: {} });

  if (mountNode) {
    const root = createRoot(mountNode);

    root.render(
      <ProviderWrapper store={store}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/courses/:courseId/learning_map"
              element={<LearningMap />}
            />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
    );
  }
});
