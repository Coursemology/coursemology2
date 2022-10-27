import { createRoot } from 'react-dom/client';

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';
import storeCreator from './store';
import GroupIndex from './pages/GroupIndex';
import GroupShow from './pages/GroupShow';

$(() => {
  const mountNode = document.getElementById('course-group-component');

  if (mountNode) {
    const store = storeCreator();
    const root = createRoot(mountNode);

    root.render(
      <ProviderWrapper store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="courses/:courseId/groups" element={<GroupIndex />}>
              <Route path=":groupCategoryId" element={<GroupShow />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
    );
  }
});
