import { render } from 'react-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import configureStore from './store';
import LeaderboardIndex from './pages/LeaderboardIndex';
import UsersIndex from '../users/pages/UsersIndex';
import UserShow from '../users/pages/UserShow';

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
            <Route path="/courses/:courseId/users/" element={<UsersIndex />} />
            <Route
              path="/courses/:courseId/users/:userId"
              element={<UserShow />}
            />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
      mountNode,
    );
  }
});
