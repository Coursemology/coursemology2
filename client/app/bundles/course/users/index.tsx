import { render } from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import UsersIndex from './pages/UsersIndex';
import UserShow from './pages/UserShow';
import configureStore from './store';

$(() => {
  const mountNode = document.getElementById('course-users-component');

  if (mountNode) {
    const store = configureStore();

    render(
      <ProviderWrapper {...{ store }}>
        <BrowserRouter>
          <Routes>
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
