import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import CourseShow from './pages/CourseShow';
import CoursesIndex from './pages/CoursesIndex';
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
            <Route element={<CoursesIndex />} path="/courses" />
            <Route element={<CourseShow />} path="/courses/:courseId" />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
    );
  }
});
