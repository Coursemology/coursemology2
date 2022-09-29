import { render } from 'react-dom';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import storeCreator from './store';
import GroupIndex from './pages/GroupIndex';
import GroupShow from './pages/GroupShow';

$(() => {
  const mountNode = document.getElementById('course-group-component');

  const store = storeCreator();

  if (mountNode) {
    render(
      <ProviderWrapper store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="courses/:courseId/groups" element={<GroupIndex />}>
              <Route path=":groupCategoryId" element={<GroupShow />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
      mountNode,
    );
  }
});
