import { BrowserRouter, Route, Routes } from 'react-router-dom';

import EditForumPostResponsePage from 'bundles/course/assessment/question/forum-post-responses/EditForumPostResponsePage';
import NewForumPostResponsePage from 'bundles/course/assessment/question/forum-post-responses/NewForumPostResponsePage';
import SubmissionsIndex from 'bundles/course/assessment/submissions/SubmissionsIndex';
import DisbursementIndex from 'bundles/course/experience-points/disbursement/pages/DisbursementIndex';
import TimelineDesigner from 'bundles/course/reference-timelines/TimelineDesigner';
import AccountSettings from 'bundles/user/AccountSettings';

import App from './App';

const RoutedApp = (): JSX.Element => {
  return (
    <App>
      <BrowserRouter>
        <Routes>
          <Route
            element={<SubmissionsIndex />}
            path="/courses/:courseId/assessments/submissions"
          />

          <Route
            element={<TimelineDesigner />}
            path="/courses/:course_id/timelines"
          />

          <Route
            element={<DisbursementIndex />}
            path="/courses/:courseId/users/disburse_experience_points"
          />

          <Route element={<AccountSettings />} path="/user/profile/edit" />

          <Route
            element={<NewForumPostResponsePage />}
            path="courses/:courseId/assessments/:assessmentId/question/forum_post_responses/new"
          />

          <Route
            element={<EditForumPostResponsePage />}
            path="/courses/:courseId/assessments/:assessmentId/question/forum_post_responses/:questionId/edit"
          />
        </Routes>
      </BrowserRouter>
    </App>
  );
};

export default RoutedApp;
