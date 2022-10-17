import { render } from 'react-dom';
import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import configureStore from './store';
import LeaderboardIndex from './pages/LeaderboardIndex';

$(() => {
  const mountNode = document.getElementById('course-leaderboard-component');

  if (mountNode) {
    const store = configureStore();

    render(
      <ProviderWrapper {...{ store }}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/courses/:courseId/leaderboard/"
              element={<LeaderboardIndex />}
            />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
      mountNode,
    );
  }
});
