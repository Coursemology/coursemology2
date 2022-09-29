import { render } from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import NotificationPopup from 'lib/containers/NotificationPopup';
import Level from 'course/level/pages/Level';
import storeCreator from './store';

$(() => {
  const mountNode = document.getElementById('course-level');

  if (mountNode) {
    const store = storeCreator({});

    render(
      <ProviderWrapper store={store}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/courses/:courseId/levels"
              element={
                <div>
                  <NotificationPopup />
                  <Level />
                </div>
              }
            />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
      mountNode,
    );
  }
});
