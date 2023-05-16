import { Navigate, Route, Routes } from 'react-router-dom';

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
import AssessmentEdit from 'bundles/course/assessment/pages/AssessmentEdit';
import AssessmentMonitoring from 'bundles/course/assessment/pages/AssessmentMonitoring';
import AssessmentShow from 'bundles/course/assessment/pages/AssessmentShow';
import AssessmentsIndex from 'bundles/course/assessment/pages/AssessmentsIndex';
import AssessmentStatisticsPage from 'bundles/course/assessment/pages/AssessmentStatistics';
import EditForumPostResponsePage from 'bundles/course/assessment/question/forum-post-responses/EditForumPostResponsePage';
import NewForumPostResponsePage from 'bundles/course/assessment/question/forum-post-responses/NewForumPostResponsePage';
import EditMcqMrqPage from 'bundles/course/assessment/question/multiple-responses/EditMcqMrqPage';
import NewMcqMrqPage from 'bundles/course/assessment/question/multiple-responses/NewMcqMrqPage';
import EditProgrammingQuestionPage from 'bundles/course/assessment/question/programming/EditProgrammingQuestionPage';
import NewProgrammingQuestionPage from 'bundles/course/assessment/question/programming/NewProgrammingQuestionPage';
import ScribingQuestion from 'bundles/course/assessment/question/scribing/ScribingQuestion';
import EditTextResponse from 'bundles/course/assessment/question/text-responses/EditTextResponsePage';
import NewTextResponse from 'bundles/course/assessment/question/text-responses/NewTextResponsePage';
import EditVoicePage from 'bundles/course/assessment/question/voice-responses/EditVoicePage';
import NewVoicePage from 'bundles/course/assessment/question/voice-responses/NewVoicePage';
import AssessmentSessionNew from 'bundles/course/assessment/sessions/pages/AssessmentSessionNew';
import SkillsIndex from 'bundles/course/assessment/skills/pages/SkillsIndex';
import LogsIndex from 'bundles/course/assessment/submission/pages/LogsIndex';
import SubmissionEditIndex from 'bundles/course/assessment/submission/pages/SubmissionEditIndex';
import AssessmentSubmissionsIndex from 'bundles/course/assessment/submission/pages/SubmissionsIndex';
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
import ResponseEdit from 'bundles/course/survey/pages/ResponseEdit';
import ResponseIndex from 'bundles/course/survey/pages/ResponseIndex';
import ResponseShow from 'bundles/course/survey/pages/ResponseShow';
import SurveyIndex from 'bundles/course/survey/pages/SurveyIndex';
import SurveyResults from 'bundles/course/survey/pages/SurveyResults';
import SurveyShow from 'bundles/course/survey/pages/SurveyShow';
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
import InstanceAdminIndex from 'bundles/system/admin/instance/instance/pages/InstanceAdminIndex';
import InstanceAdminNavigator from 'bundles/system/admin/instance/instance/pages/InstanceAdminNavigator';
import InstanceAnnouncementsIndex from 'bundles/system/admin/instance/instance/pages/InstanceAnnouncementsIndex';
import InstanceComponentsIndex from 'bundles/system/admin/instance/instance/pages/InstanceComponentsIndex';
import InstanceCoursesIndex from 'bundles/system/admin/instance/instance/pages/InstanceCoursesIndex';
import InstanceUserRoleRequestsIndex from 'bundles/system/admin/instance/instance/pages/InstanceUserRoleRequestsIndex';
import InstanceUsersIndex from 'bundles/system/admin/instance/instance/pages/InstanceUsersIndex';
import InstanceUsersInvitations from 'bundles/system/admin/instance/instance/pages/InstanceUsersInvitations';
import InstanceUsersInvite from 'bundles/system/admin/instance/instance/pages/InstanceUsersInvite';
import AccountSettings from 'bundles/user/AccountSettings';
import UserShow from 'bundles/users/pages/UserShow';
import UserEmailSubscriptions from 'course/user-email-subscriptions/UserEmailSubscriptions';

const RoutedApp = (): JSX.Element => (
  <Routes>
    <Route path="courses">
      <Route element={<CoursesIndex />} index />

      <Route path=":courseId">
        <Route element={<CourseShow />} index />
        <Route element={<TimelineDesigner />} path="timelines" />
        <Route element={<AnnouncementsIndex />} path="announcements" />
        <Route element={<CommentIndex />} path="comments" />
        <Route element={<LeaderboardIndex />} path="leaderboard" />
        <Route element={<LearningMap />} path="learning_map" />
        <Route element={<FolderShow />} path="materials/folders/:folderId" />
        <Route element={<LevelsIndex />} path="levels" />
        <Route element={<StatisticsIndex />} path="statistics" />
        <Route element={<Duplication />} path="duplication" />

        {/* @ts-ignore `connect` throws error when cannot find `store` as direct parent */}
        <Route element={<LessonPlanLayout />} path="lesson_plan">
          <Route element={<LessonPlanShow />} index />
          <Route element={<LessonPlanEdit />} path="edit" />
        </Route>

        <Route element={<UserRequests />} path="enrol_requests" />
        <Route element={<InvitationsIndex />} path="user_invitations" />
        <Route element={<ManageStudents />} path="students" />
        <Route element={<ManageStaff />} path="staff" />

        <Route path="users">
          <Route element={<UsersIndex />} index />
          <Route element={<PersonalTimes />} path="personal_times" />
          <Route element={<InviteUsers />} path="invite" />

          <Route path=":userId">
            <Route element={<CourseUserShow />} index />
            <Route element={<PersonalTimesShow />} path="personal_times" />

            <Route
              element={<UserVideoSubmissionsIndex />}
              path="video_submissions"
            />

            <Route
              element={<ExperiencePointsRecords />}
              path="experience_points_records"
            />

            <Route
              element={<UserEmailSubscriptions />}
              path="manage_email_subscription"
            />
          </Route>
        </Route>

        <Route element={<SettingsNavigation />} path="admin">
          <Route element={<CourseSettings />} index />
          <Route element={<ComponentSettings />} path="components" />
          <Route element={<SidebarSettings />} path="sidebar" />
          <Route element={<NotificationSettings />} path="notifications" />
          <Route element={<AnnouncementSettings />} path="announcements" />
          <Route element={<AssessmentSettings />} path="assessments" />
          <Route element={<MaterialsSettings />} path="materials" />
          <Route element={<ForumsSettings />} path="forums" />
          <Route element={<LeaderboardSettings />} path="leaderboard" />
          <Route element={<CommentsSettings />} path="comments" />
          <Route element={<VideosSettings />} path="videos" />
          <Route element={<LessonPlanSettings />} path="lesson_plan" />
          <Route element={<CodaveriSettings />} path="codaveri" />
        </Route>

        <Route path="surveys">
          <Route element={<SurveyIndex />} index />

          <Route path=":surveyId">
            <Route element={<SurveyShow />} index />
            <Route element={<SurveyResults />} path="results" />

            <Route path="responses">
              <Route element={<ResponseIndex />} index />

              <Route path=":responseId">
                <Route element={<ResponseShow />} index />
                <Route element={<ResponseEdit />} path="edit" />
              </Route>
            </Route>
          </Route>
        </Route>

        <Route element={<GroupIndex />} path="groups">
          <Route element={<GroupShow />} path=":groupCategoryId" />
        </Route>

        <Route path="videos">
          <Route element={<VideosIndex />} index />

          <Route path=":videoId">
            <Route element={<VideoShow />} index />

            <Route path="submissions">
              <Route element={<VideoSubmissionsIndex />} index />

              <Route path=":submissionId">
                <Route element={<VideoSubmissionShow />} index />
                <Route element={<VideoSubmissionEdit />} path="edit" />
              </Route>
            </Route>
          </Route>
        </Route>

        <Route path="forums">
          <Route element={<ForumsIndex />} index />

          <Route path=":forumId">
            <Route element={<ForumShow />} index />
            <Route element={<ForumTopicShow />} path="topics/:topicId" />
          </Route>
        </Route>

        <Route path="assessments">
          <Route element={<AssessmentsIndex />} index />
          <Route element={<SubmissionsIndex />} path="submissions" />
          <Route element={<SkillsIndex />} path="skills" />

          <Route path=":assessmentId">
            <Route element={<AssessmentShow />} index />
            <Route element={<AssessmentEdit />} path="edit" />
            <Route element={<AssessmentMonitoring />} path="monitoring" />
            <Route element={<AssessmentSessionNew />} path="sessions/new" />

            {/* @ts-ignore `connect` throws error when cannot find `store` as direct parent */}
            <Route element={<AssessmentStatisticsPage />} path="statistics" />

            <Route path="submissions">
              <Route element={<AssessmentSubmissionsIndex />} index />

              <Route path=":submissionId">
                <Route element={<SubmissionEditIndex />} path="edit" />
                <Route element={<LogsIndex />} path="logs" />
              </Route>
            </Route>

            <Route path="question">
              <Route path="forum_post_responses">
                <Route element={<NewForumPostResponsePage />} path="new" />

                <Route
                  element={<EditForumPostResponsePage />}
                  path=":questionId/edit"
                />
              </Route>

              <Route path="text_responses">
                <Route element={<NewTextResponse />} path="new" />
                <Route element={<EditTextResponse />} path=":questionId/edit" />
              </Route>

              <Route path="voice_responses">
                <Route element={<NewVoicePage />} path="new" />
                <Route element={<EditVoicePage />} path=":questionId/edit" />
              </Route>

              <Route path="multiple_responses">
                <Route element={<NewMcqMrqPage />} path="new" />
                <Route element={<EditMcqMrqPage />} path=":questionId/edit" />
              </Route>

              <Route path="scribing">
                <Route element={<ScribingQuestion />} path="new" />
                <Route element={<ScribingQuestion />} path=":questionId/edit" />
              </Route>

              <Route path="programming">
                <Route element={<NewProgrammingQuestionPage />} path="new" />

                <Route
                  element={<EditProgrammingQuestionPage />}
                  path=":questionId/edit"
                />
              </Route>
            </Route>
          </Route>
        </Route>

        <Route path="achievements">
          <Route element={<AchievementsIndex />} index />
          <Route element={<AchievementShow />} path=":achievementId" />
        </Route>

        <Route path="users">
          <Route
            element={<DisbursementIndex />}
            path="disburse_experience_points"
          />
        </Route>
      </Route>
    </Route>

    <Route element={<GlobalAnnouncementIndex />} path="announcements" />

    <Route element={<UserShow />} path="users/:userId" />
    <Route element={<AccountSettings />} path="user/profile/edit" />

    <Route element={<AdminNavigator />} path="admin">
      <Route element={<AdminIndex />} index />
      <Route element={<AnnouncementIndex />} path="announcements" />
      <Route element={<UserIndex />} path="users" />
      <Route element={<InstancesIndex />} path="instances" />
      <Route element={<CourseIndex />} path="courses" />
    </Route>

    {/* `admin/instance` cannot be nested in `admin/*` because it has a different container element */}
    <Route element={<InstanceAdminNavigator />} path="admin/instance">
      <Route element={<InstanceAdminIndex />} index />
      <Route element={<InstanceAnnouncementsIndex />} path="announcements" />
      <Route element={<InstanceComponentsIndex />} path="components" />
      <Route element={<InstanceCoursesIndex />} path="courses" />
      <Route element={<InstanceUsersIndex />} path="users" />
      <Route element={<InstanceUsersInvite />} path="users/invite" />
      <Route element={<InstanceUsersInvitations />} path="user_invitations" />
      <Route element={<InstanceUserRoleRequestsIndex />} path="role_requests" />
    </Route>

    {/* `/role_requests` will be routed without `InstanceAdminNavigator` and its sidebar.
          Here, we redirect `/role_requests` to `/admin/instance/role_requests`. But until
          we are loading the page without Rails' router, fresh loads to `/role_requests` will
          go to 404. Once we are 100% SPA, this is a non-issue. */}
    <Route
      element={<Navigate to="/admin/instance/role_requests" />}
      path="role_requests"
    />
  </Routes>
);

export default RoutedApp;
