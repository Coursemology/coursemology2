import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { enableMapSet } from 'immer';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import { store } from './store';
import TimelineDesigner from './TimelineDesigner';

$(() => {
  const mountNode = document.getElementById('app-root');
  if (!mountNode) return;

  const root = createRoot(mountNode);

  // TODO: Move this to React root once SPA
  enableMapSet();

  root.render(
    <ProviderWrapper store={store}>
      <BrowserRouter>
        <Routes>
          <Route
            element={<TimelineDesigner />}
            path="/courses/:course_id/timelines"
          />
        </Routes>
      </BrowserRouter>
    </ProviderWrapper>,
  );
});
