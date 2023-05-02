import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import StatisticsIndex from './pages/StatisticsIndex';
import storeCreator from './store';

$(() => {
  const mountNode = document.getElementById('app-root');
  if (mountNode) {
    const root = createRoot(mountNode);
    const store = storeCreator();
    root.render(
      <ProviderWrapper store={store}>
        <BrowserRouter>
          <Routes>
            <Route
              element={<StatisticsIndex />}
              path="/courses/:courseId/statistics"
            />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
      mountNode,
    );
  }
});
