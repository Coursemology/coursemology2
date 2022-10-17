import { render } from 'react-dom';
import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import configureStore from './store';
import CommentIndex from './pages/CommentIndex';

$(() => {
  const mountNode = document.getElementById('course-comments-component');

  if (mountNode) {
    const store = configureStore();

    render(
      <ProviderWrapper {...{ store }}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/courses/:courseId/comments"
              element={<CommentIndex />}
            />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
      mountNode,
    );
  }
});
