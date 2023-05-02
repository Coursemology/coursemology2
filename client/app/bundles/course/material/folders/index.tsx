import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import FolderShow from './pages/FolderShow';
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
              element={<FolderShow />}
              path="/courses/:courseId/materials/folders/:folderId"
            />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
    );
  }
});
