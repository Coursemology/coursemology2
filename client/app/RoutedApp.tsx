import { BrowserRouter, Route, Routes } from 'react-router-dom';

import EditForumPostResponsePage from 'bundles/course/assessment/question/forum-post-responses/EditForumPostResponsePage';
import NewForumPostResponsePage from 'bundles/course/assessment/question/forum-post-responses/NewForumPostResponsePage';
import EditMcqMrqPage from 'bundles/course/assessment/question/multiple-responses/EditMcqMrqPage';
import NewMcqMrqPage from 'bundles/course/assessment/question/multiple-responses/NewMcqMrqPage';
import EditTextResponsePage from 'bundles/course/assessment/question/text-responses/EditTextResponsePage';
import NewTextResponsePage from 'bundles/course/assessment/question/text-responses/NewTextResponsePage';
import EditVoicePage from 'bundles/course/assessment/question/voice-responses/EditVoicePage';
import NewVoicePage from 'bundles/course/assessment/question/voice-responses/NewVoicePage';
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

          <Route
            element={<NewMcqMrqPage />}
            path="/courses/:courseId/assessments/:assessmentId/question/multiple_responses/new"
          />

          <Route
            element={<EditMcqMrqPage />}
            path="/courses/:courseId/assessments/:assessmentId/question/multiple_responses/:questionId/edit"
          />

          <Route
            element={<NewTextResponsePage />}
            path="courses/:courseId/assessments/:assessmentId/question/text_responses/new"
          />

          <Route
            element={<EditTextResponsePage />}
            path="/courses/:courseId/assessments/:assessmentId/question/text_responses/:questionId/edit"
          />

          <Route
            element={<NewVoicePage />}
            path="courses/:courseId/assessments/:assessmentId/question/voice_responses/new"
          />

          <Route
            element={<EditVoicePage />}
            path="/courses/:courseId/assessments/:assessmentId/question/voice_responses/:questionId/edit"
          />
        </Routes>
      </BrowserRouter>
    </App>
  );
};

export default RoutedApp;
