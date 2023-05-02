import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import LearningMap from './containers/LearningMap';
import storeCreator from './store';

$(() => {
  const mountNode = document.getElementById('app-root');
  const store = storeCreator({ learningMap: {} });

  if (mountNode) {
    const root = createRoot(mountNode);

    root.render(
      <ProviderWrapper store={store}>
        <BrowserRouter>
          <Routes>
            <Route
              element={<LearningMap />}
              path="/courses/:courseId/learning_map"
            />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
    );
  }
});
