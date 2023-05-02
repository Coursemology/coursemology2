import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Level from 'course/level/pages/Level';
import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';
import NotificationPopup from 'lib/containers/NotificationPopup';

import storeCreator from './store';

$(() => {
  const mountNode = document.getElementById('app-root');

  if (mountNode) {
    const store = storeCreator({});
    const root = createRoot(mountNode);

    root.render(
      <ProviderWrapper store={store}>
        <BrowserRouter>
          <Routes>
            <Route
              element={
                <div>
                  <NotificationPopup />
                  <Level />
                </div>
              }
              path="/courses/:courseId/levels"
            />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
    );
  }
});
