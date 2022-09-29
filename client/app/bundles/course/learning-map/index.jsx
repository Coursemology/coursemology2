import { render } from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import LearningMap from './containers/LearningMap';
import storeCreator from './store';

$(() => {
  const mountNode = document.getElementById('course-learning-map');
  const store = storeCreator({ learningMap: {} });

  if (mountNode) {
    render(
      <ProviderWrapper {...{ store }}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/courses/:courseId/learning_map"
              element={<LearningMap />}
            />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
      mountNode,
    );
  }
});
