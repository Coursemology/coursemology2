import { render } from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import AppLayout from 'lib/components/layouts/AppLayout';
import configureStore from './store';
import InstanceAdminIndex from './pages/InstanceAdminIndex';
import InstanceAnnouncementsIndex from './pages/InstanceAnnouncementsIndex';
import InstanceAdminSidebar from './components/navigation/InstanceAdminSidebar';
import InstanceUsersIndex from './pages/InstanceUsersIndex';
import InstanceCoursesIndex from './pages/InstanceCoursesIndex';
import InstanceComponentsIndex from './pages/InstanceComponentsIndex';
import InstanceUserRoleRequestsIndex from './pages/InstanceUserRoleRequestsIndex';
import InstanceUsersInvite from './pages/InstanceUsersInvite';
import InstanceUsersInvitations from './pages/InstanceUsersInvitations';

$(() => {
  const mountNode = document.getElementById('system-instance-admin-component');

  if (mountNode) {
    const store = configureStore();

    const renderSidebar = (isExpanded, handleExpand): JSX.Element => {
      return (
        <InstanceAdminSidebar
          isExpanded={isExpanded}
          handleExpand={handleExpand}
        />
      );
    };

    render(
      <ProviderWrapper store={store}>
        <BrowserRouter>
          <AppLayout
            renderSidebar={renderSidebar}
            routes={
              <Routes>
                <Route
                  path="/admin/instance"
                  element={<InstanceAdminIndex />}
                />
                <Route
                  path="/admin/instance/announcements"
                  element={<InstanceAnnouncementsIndex />}
                />
                <Route
                  path="/admin/instance/components"
                  element={<InstanceComponentsIndex />}
                />
                <Route
                  path="/admin/instance/courses"
                  element={<InstanceCoursesIndex />}
                />
                <Route
                  path="/admin/instance/users"
                  element={<InstanceUsersIndex />}
                />
                <Route
                  path="/admin/instance/users/invite"
                  element={<InstanceUsersInvite />}
                />
                <Route
                  path="/admin/instance/user_invitations"
                  element={<InstanceUsersInvitations />}
                />
                <Route
                  path="/role_requests"
                  element={<InstanceUserRoleRequestsIndex />}
                />
              </Routes>
            }
          />
        </BrowserRouter>
      </ProviderWrapper>,
      mountNode,
    );
  }
});
