import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import GroupIndex from './pages/GroupIndex';
import GroupShow from './pages/GroupShow';
import storeCreator from './store';

$(() => {
  const mountNode = document.getElementById('app-root');

  if (mountNode) {
    const store = storeCreator();
    const root = createRoot(mountNode);

    root.render(
      <ProviderWrapper store={store}>
        <BrowserRouter>
          <Routes>
            <Route element={<GroupIndex />} path="courses/:courseId/groups">
              <Route element={<GroupShow />} path=":groupCategoryId" />
            </Route>
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
    );
  }
});
