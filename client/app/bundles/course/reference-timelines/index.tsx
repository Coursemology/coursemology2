import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from 'App';

import TimelineDesigner from './TimelineDesigner';

$(() => {
  const mountNode = document.getElementById('app-root');
  if (!mountNode) return;

  const root = createRoot(mountNode);

  root.render(
    <App>
      <BrowserRouter>
        <Routes>
          <Route
            element={<TimelineDesigner />}
            path="/courses/:course_id/timelines"
          />
        </Routes>
      </BrowserRouter>
    </App>,
  );
});
