import { render } from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProviderWrapper from 'lib/components/ProviderWrapper';
import UsersIndex from './pages/UsersIndex';
import UserShow from './pages/UserShow';
import ManageStudents from './pages/ManageStudents';
import ManageStaff from './pages/ManageStaff';
import PersonalTimes from './pages/PersonalTimes';
import PersonalTimesShow from './pages/PersonalTimesShow';
import UserRequests from '../enrol-requests/pages/UserRequests';
import InviteUsers from '../user-invitations/pages/InviteUsers';
import InvitationsIndex from '../user-invitations/pages/InvitationsIndex';
import configureStore from './store';
import ExperiencePointsRecords from './pages/ExperiencePointsRecords';

$(() => {
  const mountNode = document.getElementById('course-users-component');

  if (mountNode) {
    const store = configureStore();

    render(
      <ProviderWrapper {...{ store }}>
        <BrowserRouter>
          <Routes>
            <Route path="/courses/:courseId/users" element={<UsersIndex />} />
            <Route
              path="/courses/:courseId/users/:userId"
              element={<UserShow />}
            />
            <Route
              path="/courses/:courseId/students"
              element={<ManageStudents />}
            />
            <Route
              path="/courses/:courseId/enrol_requests"
              element={<UserRequests />}
            />
            <Route
              path="/courses/:courseId/users/invite/"
              element={<InviteUsers />}
            />
            <Route
              path="/courses/:courseId/user_invitations"
              element={<InvitationsIndex />}
            />
            <Route path="/courses/:courseId/staff" element={<ManageStaff />} />
            <Route
              path="/courses/:courseId/users/personal_times"
              element={<PersonalTimes />}
            />
            <Route
              path="/courses/:courseId/users/:userId/personal_times"
              element={<PersonalTimesShow />}
            />
            <Route
              path="/courses/:courseId/users/:userId/experience_points_records"
              element={<ExperiencePointsRecords />}
            />
          </Routes>
        </BrowserRouter>
      </ProviderWrapper>,
      mountNode,
    );
  }
});
