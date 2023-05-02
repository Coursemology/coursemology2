import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import AppLayout from 'lib/components/core/layouts/AppLayout';
import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import InstanceAdminSidebar from './components/navigation/InstanceAdminSidebar';
import InstanceAdminIndex from './pages/InstanceAdminIndex';
import InstanceAnnouncementsIndex from './pages/InstanceAnnouncementsIndex';
import InstanceComponentsIndex from './pages/InstanceComponentsIndex';
import InstanceCoursesIndex from './pages/InstanceCoursesIndex';
import InstanceUserRoleRequestsIndex from './pages/InstanceUserRoleRequestsIndex';
import InstanceUsersIndex from './pages/InstanceUsersIndex';
import InstanceUsersInvitations from './pages/InstanceUsersInvitations';
import InstanceUsersInvite from './pages/InstanceUsersInvite';
import configureStore from './store';

$(() => {
  const mountNode = document.getElementById('app-root');

  if (mountNode) {
    const store = configureStore();
    const root = createRoot(mountNode);

    const renderSidebar = (isExpanded, handleExpand): JSX.Element => {
      return (
        <InstanceAdminSidebar
          handleExpand={handleExpand}
          isExpanded={isExpanded}
        />
      );
    };

    root.render(
      <ProviderWrapper store={store}>
        <BrowserRouter>
          <AppLayout
            renderSidebar={renderSidebar}
            routes={
              <Routes>
                <Route
                  element={<InstanceAdminIndex />}
                  path="/admin/instance"
                />
                <Route
                  element={<InstanceAnnouncementsIndex />}
                  path="/admin/instance/announcements"
                />
                <Route
                  element={<InstanceComponentsIndex />}
                  path="/admin/instance/components"
                />
                <Route
                  element={<InstanceCoursesIndex />}
                  path="/admin/instance/courses"
                />
                <Route
                  element={<InstanceUsersIndex />}
                  path="/admin/instance/users"
                />
                <Route
                  element={<InstanceUsersInvite />}
                  path="/admin/instance/users/invite"
                />
                <Route
                  element={<InstanceUsersInvitations />}
                  path="/admin/instance/user_invitations"
                />
                <Route
                  element={<InstanceUserRoleRequestsIndex />}
                  path="/role_requests"
                />
              </Routes>
            }
          />
        </BrowserRouter>
      </ProviderWrapper>,
    );
  }
});
