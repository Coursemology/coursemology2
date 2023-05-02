import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ProviderWrapper from 'lib/components/wrappers/ProviderWrapper';

import UserRequests from '../enrol-requests/pages/UserRequests';
import InvitationsIndex from '../user-invitations/pages/InvitationsIndex';
import InviteUsers from '../user-invitations/pages/InviteUsers';

import ExperiencePointsRecords from './pages/ExperiencePointsRecords';
import ManageStaff from './pages/ManageStaff';
import ManageStudents from './pages/ManageStudents';
import PersonalTimes from './pages/PersonalTimes';
import PersonalTimesShow from './pages/PersonalTimesShow';
import UserShow from './pages/UserShow';
import UsersIndex from './pages/UsersIndex';
import configureStore from './store';

$(() => {
  const mountNode = document.getElementById('app-root');

  if (mountNode) {
    const store = configureStore();
    const root = createRoot(mountNode);

    root.render(
      <ProviderWrapper store={store}>
        <BrowserRouter>
          <Routes>
            <Route element={<UsersIndex />} path="/courses/:courseId/users" />
            <Route
              element={<UserShow />}
              path="/courses/:courseId/users/:userId"
            />
            <Route
              element={<ManageStudents />}
              path="/courses/:courseId/students"
            />
            <Route
              element={<UserRequests />}
              path="/courses/:courseId/enrol_requests"
            />
            <Route
              element={<InviteUsers />}
              path="/courses/:courseId/users/invite/"
            />
            <Route
              element={<InvitationsIndex />}
              path="/courses/:courseId/user_invitations"
            />
            <Route element={<ManageStaff />} path="/courses/:courseId/staff" />
            <Route
              element={<PersonalTimes />}
              path="/courses/:courseId/users/personal_times"
            />
            <Route
              element={<PersonalTimesShow />}
              path="/courses/:courseId/users/:userId/personal_times"
            />
            <Route
              element={<ExperiencePointsRecords />}
              path="/courses/:courseId/users/:userId/experience_points_records"
            />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
    );
  }
});
