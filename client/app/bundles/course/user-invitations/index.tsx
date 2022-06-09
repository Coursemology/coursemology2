import { render } from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import InviteUsers from './pages/InviteUsers';
import InvitationsIndex from './pages/InvitationsIndex';
import configureStore from './store';

$(() => {
  const mountNode = document.getElementById('user-invitations-component');

  if (mountNode) {
    const store = configureStore();

    render(
      <ProviderWrapper {...{ store }}>
        <BrowserRouter>
          <Routes>
            <Route
              path="/courses/:courseId/users/invite/"
              element={<InviteUsers />}
            />
            <Route
              path="/courses/:courseId/user_invitations"
              element={<InvitationsIndex />}
            />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
      mountNode,
    );
  }
});
