import { BrowserRouter, Route, Routes } from 'react-router-dom';

import GlobalAnnouncementIndex from 'bundles/announcements/GlobalAnnouncementIndex';
import AchievementShow from 'bundles/course/achievement/pages/AchievementShow';
import AchievementsIndex from 'bundles/course/achievement/pages/AchievementsIndex';
import SettingsNavigation from 'bundles/course/admin/components/SettingsNavigation';
import AnnouncementSettings from 'bundles/course/admin/pages/AnnouncementsSettings';
import AssessmentSettings from 'bundles/course/admin/pages/AssessmentSettings';
import CodaveriSettings from 'bundles/course/admin/pages/CodaveriSettings';
import CommentsSettings from 'bundles/course/admin/pages/CommentsSettings';
import ComponentSettings from 'bundles/course/admin/pages/ComponentSettings';
import CourseSettings from 'bundles/course/admin/pages/CourseSettings';
import ForumsSettings from 'bundles/course/admin/pages/ForumsSettings';
import LeaderboardSettings from 'bundles/course/admin/pages/LeaderboardSettings';
import LessonPlanSettings from 'bundles/course/admin/pages/LessonPlanSettings';
import MaterialsSettings from 'bundles/course/admin/pages/MaterialsSettings';
import NotificationSettings from 'bundles/course/admin/pages/NotificationSettings';
import SidebarSettings from 'bundles/course/admin/pages/SidebarSettings';
import VideosSettings from 'bundles/course/admin/pages/VideosSettings';
import AnnouncementsIndex from 'bundles/course/announcements/pages/AnnouncementsIndex';
import EditForumPostResponsePage from 'bundles/course/assessment/question/forum-post-responses/EditForumPostResponsePage';
import NewForumPostResponsePage from 'bundles/course/assessment/question/forum-post-responses/NewForumPostResponsePage';
import EditMcqMrqPage from 'bundles/course/assessment/question/multiple-responses/EditMcqMrqPage';
import NewMcqMrqPage from 'bundles/course/assessment/question/multiple-responses/NewMcqMrqPage';
import EditProgrammingQuestionPage from 'bundles/course/assessment/question/programming/EditProgrammingQuestionPage';
import NewProgrammingQuestionPage from 'bundles/course/assessment/question/programming/NewProgrammingQuestionPage';
import ScribingQuestion from 'bundles/course/assessment/question/scribing/ScribingQuestion';
import EditTextResponsePage from 'bundles/course/assessment/question/text-responses/EditTextResponsePage';
import NewTextResponsePage from 'bundles/course/assessment/question/text-responses/NewTextResponsePage';
import EditVoicePage from 'bundles/course/assessment/question/voice-responses/EditVoicePage';
import NewVoicePage from 'bundles/course/assessment/question/voice-responses/NewVoicePage';
import SkillsIndex from 'bundles/course/assessment/skills/pages/SkillsIndex';
import SubmissionsIndex from 'bundles/course/assessment/submissions/SubmissionsIndex';
import CourseShow from 'bundles/course/courses/pages/CourseShow';
import CoursesIndex from 'bundles/course/courses/pages/CoursesIndex';
import CommentIndex from 'bundles/course/discussion/topics/pages/CommentIndex';
import Duplication from 'bundles/course/duplication/pages/Duplication';
import UserRequests from 'bundles/course/enrol-requests/pages/UserRequests';
import DisbursementIndex from 'bundles/course/experience-points/disbursement/pages/DisbursementIndex';
import ForumShow from 'bundles/course/forum/pages/ForumShow';
import ForumsIndex from 'bundles/course/forum/pages/ForumsIndex';
import ForumTopicShow from 'bundles/course/forum/pages/ForumTopicShow';
import GroupIndex from 'bundles/course/group/pages/GroupIndex';
import GroupShow from 'bundles/course/group/pages/GroupShow';
import LeaderboardIndex from 'bundles/course/leaderboard/pages/LeaderboardIndex';
import LearningMap from 'bundles/course/learning-map/containers/LearningMap';
import LessonPlanLayout from 'bundles/course/lesson-plan/containers/LessonPlanLayout';
import LessonPlanEdit from 'bundles/course/lesson-plan/pages/LessonPlanEdit';
import LessonPlanShow from 'bundles/course/lesson-plan/pages/LessonPlanShow';
import LevelsIndex from 'bundles/course/level/pages/LevelsIndex';
import FolderShow from 'bundles/course/material/folders/pages/FolderShow';
import TimelineDesigner from 'bundles/course/reference-timelines/TimelineDesigner';
import StatisticsIndex from 'bundles/course/statistics/pages/StatisticsIndex';
import InvitationsIndex from 'bundles/course/user-invitations/pages/InvitationsIndex';
import InviteUsers from 'bundles/course/user-invitations/pages/InviteUsers';
import ExperiencePointsRecords from 'bundles/course/users/pages/ExperiencePointsRecords';
import ManageStaff from 'bundles/course/users/pages/ManageStaff';
import ManageStudents from 'bundles/course/users/pages/ManageStudents';
import PersonalTimes from 'bundles/course/users/pages/PersonalTimes';
import PersonalTimesShow from 'bundles/course/users/pages/PersonalTimesShow';
import CourseUserShow from 'bundles/course/users/pages/UserShow';
import UsersIndex from 'bundles/course/users/pages/UsersIndex';
import VideoShow from 'bundles/course/video/pages/VideoShow';
import VideosIndex from 'bundles/course/video/pages/VideosIndex';
import VideoSubmissionEdit from 'bundles/course/video/submission/pages/VideoSubmissionEdit';
import VideoSubmissionShow from 'bundles/course/video/submission/pages/VideoSubmissionShow';
import VideoSubmissionsIndex from 'bundles/course/video/submission/pages/VideoSubmissionsIndex';
import UserVideoSubmissionsIndex from 'bundles/course/video-submissions/pages/UserVideoSubmissionsIndex';
import AdminIndex from 'bundles/system/admin/admin/pages/AdminIndex';
import AdminNavigator from 'bundles/system/admin/admin/pages/AdminNavigator';
import AnnouncementIndex from 'bundles/system/admin/admin/pages/AnnouncementsIndex';
import CourseIndex from 'bundles/system/admin/admin/pages/CoursesIndex';
import InstancesIndex from 'bundles/system/admin/admin/pages/InstancesIndex';
import UserIndex from 'bundles/system/admin/admin/pages/UsersIndex';
import AccountSettings from 'bundles/user/AccountSettings';
import UserShow from 'bundles/users/pages/UserShow';
import NotificationPopup from 'lib/containers/NotificationPopup';

import App from './App';

const pages = [
  { path: 'components', element: <ComponentSettings /> },
  { path: 'sidebar', element: <SidebarSettings /> },
  { path: 'notifications', element: <NotificationSettings /> },
  { path: 'announcements', element: <AnnouncementSettings /> },
  { path: 'assessments', element: <AssessmentSettings /> },
  { path: 'materials', element: <MaterialsSettings /> },
  { path: 'forums', element: <ForumsSettings /> },
  { path: 'leaderboard', element: <LeaderboardSettings /> },
  { path: 'comments', element: <CommentsSettings /> },
  { path: 'videos', element: <VideosSettings /> },
  { path: 'lesson_plan', element: <LessonPlanSettings /> },
  { path: 'codaveri', element: <CodaveriSettings /> },
];

const RoutedApp = (): JSX.Element => {
  return (
    <App>
      <BrowserRouter>
        <Routes>
          <Route element={<AdminNavigator />} path="/admin">
            <Route element={<AdminIndex />} index />
            <Route element={<AnnouncementIndex />} path="announcements" />
            <Route element={<UserIndex />} path="users" />
            <Route element={<InstancesIndex />} path="instances" />
            <Route element={<CourseIndex />} path="courses" />
          </Route>

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

          <Route element={<GlobalAnnouncementIndex />} path="/announcements" />

          <Route
            element={<AchievementsIndex />}
            path="/courses/:courseId/achievements/"
          />

          <Route
            element={<AchievementShow />}
            path="/courses/:courseId/achievements/:achievementId"
          />

          <Route
            element={<AnnouncementsIndex />}
            path="courses/:courseId/announcements"
          />

          <Route
            element={<SkillsIndex />}
            path="/courses/:courseId/assessments/skills"
          />

          <Route element={<CoursesIndex />} path="/courses" />

          <Route element={<CourseShow />} path="/courses/:courseId" />

          <Route
            element={<CommentIndex />}
            path="/courses/:courseId/comments"
          />

          <Route element={<ForumsIndex />} path="courses/:courseId/forums" />

          <Route
            element={<ForumShow />}
            path="courses/:courseId/forums/:forumId"
          />

          <Route
            element={<ForumTopicShow />}
            path="courses/:courseId/forums/:forumId/topics/:topicId"
          />

          <Route
            element={<LeaderboardIndex />}
            path="/courses/:courseId/leaderboard/"
          />

          <Route
            element={<LearningMap />}
            path="/courses/:courseId/learning_map"
          />

          <Route
            element={<FolderShow />}
            path="/courses/:courseId/materials/folders/:folderId"
          />

          <Route element={<VideosIndex />} path="courses/:courseId/videos" />
          <Route
            element={<VideoShow />}
            path="courses/:courseId/videos/:videoId"
          />
          <Route
            element={<VideoSubmissionsIndex />}
            path="courses/:courseId/videos/:videoId/submissions"
          />
          <Route
            element={<VideoSubmissionShow />}
            path="courses/:courseId/videos/:videoId/submissions/:submissionId"
          />
          <Route
            element={<VideoSubmissionEdit />}
            path="courses/:courseId/videos/:videoId/submissions/:submissionId/edit"
          />

          <Route element={<UserShow />} path="/users/:userId" />

          <Route element={<LevelsIndex />} path="/courses/:courseId/levels" />

          <Route element={<GroupIndex />} path="courses/:courseId/groups">
            <Route element={<GroupShow />} path=":groupCategoryId" />
          </Route>

          <Route
            element={<StatisticsIndex />}
            path="/courses/:courseId/statistics"
          />

          <Route element={<UsersIndex />} path="/courses/:courseId/users" />

          <Route
            element={<CourseUserShow />}
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
          <Route
            element={<SettingsNavigation />}
            path="/courses/:course_id/admin"
          >
            <Route element={<CourseSettings />} index />

            {pages.map(({ path, element }) => (
              <Route key={path} element={element} path={path} />
            ))}
          </Route>

          <Route
            element={<Duplication />}
            path="/courses/:courseId/duplication"
          />

          <Route
            element={<UserVideoSubmissionsIndex />}
            path="/courses/:courseId/users/:userId/video_submissions"
          />

          <Route
            element={<ScribingQuestion />}
            path="/courses/:courseId/assessments/:assessmentId/question/scribing/new"
          />

          <Route
            element={<ScribingQuestion />}
            path="/courses/:courseId/assessments/:assessmentId/question/scribing/:questionId/edit"
          />

          <Route
            element={<NewProgrammingQuestionPage />}
            path="/courses/:courseId/assessments/:assessmentId/question/programming/new"
          />

          <Route
            element={<EditProgrammingQuestionPage />}
            path="/courses/:courseId/assessments/:assessmentId/question/programming/:questionId/edit"
          />

          <Route
            // @ts-ignore
            element={<LessonPlanLayout />}
            path="/courses/:courseId/lesson_plan"
          >
            <Route element={<LessonPlanShow />} index />
            <Route element={<LessonPlanEdit />} path="edit" />
          </Route>
        </Routes>
      </BrowserRouter>

      <NotificationPopup />
    </App>
  );
};

export default RoutedApp;
