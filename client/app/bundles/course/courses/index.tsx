import { render } from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import CoursesIndex from './pages/CoursesIndex';
import CourseShow from './pages/CourseShow';
import configureStore from './store';

$(() => {
  const mountNode = document.getElementById('courses-component');

  if (mountNode) {
    const store = configureStore();

    render(
      <ProviderWrapper {...{ store }}>
        <BrowserRouter>
          <Routes>
            <Route path="/courses" element={<CoursesIndex />} />
            <Route path="/courses/:courseId" element={<CourseShow />} />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
      mountNode,
    );
  }
});
