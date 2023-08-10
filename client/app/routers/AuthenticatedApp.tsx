/* eslint-disable sonarjs/no-duplicate-string */
import {
  createBrowserRouter,
  Navigate,
  RouteObject,
  RouterProvider,
} from 'react-router-dom';
import { resetStore } from 'store';

import GlobalAnnouncementIndex from 'bundles/announcements/GlobalAnnouncementIndex';
import DashboardPage from 'bundles/common/DashboardPage';
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
import UserEmailSubscriptions from 'bundles/course/user-email-subscriptions/UserEmailSubscriptions';
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
import AdminNavigator from 'bundles/system/admin/admin/AdminNavigator';
import AnnouncementIndex from 'bundles/system/admin/admin/pages/AnnouncementsIndex';
import CourseIndex from 'bundles/system/admin/admin/pages/CoursesIndex';
import InstancesIndex from 'bundles/system/admin/admin/pages/InstancesIndex';
import UserIndex from 'bundles/system/admin/admin/pages/UsersIndex';
import InstanceAdminNavigator from 'bundles/system/admin/instance/instance/InstanceAdminNavigator';
import InstanceAnnouncementsIndex from 'bundles/system/admin/instance/instance/pages/InstanceAnnouncementsIndex';
import InstanceComponentsIndex from 'bundles/system/admin/instance/instance/pages/InstanceComponentsIndex';
import InstanceCoursesIndex from 'bundles/system/admin/instance/instance/pages/InstanceCoursesIndex';
import InstanceUserRoleRequestsIndex from 'bundles/system/admin/instance/instance/pages/InstanceUserRoleRequestsIndex';
import InstanceUsersIndex from 'bundles/system/admin/instance/instance/pages/InstanceUsersIndex';
import InstanceUsersInvitations from 'bundles/system/admin/instance/instance/pages/InstanceUsersInvitations';
import InstanceUsersInvite from 'bundles/system/admin/instance/instance/pages/InstanceUsersInvite';
import AccountSettings from 'bundles/user/AccountSettings';
import {
  masqueradeLoader,
  stopMasqueradeLoader,
} from 'bundles/users/masqueradeLoader';
import UserShow from 'bundles/users/pages/UserShow';
import { achievementHandle } from 'course/achievement/handles';
import assessmentAttemptLoader from 'course/assessment/attemptLoader';
import {
  assessmentHandle,
  assessmentsHandle,
  questionHandle,
} from 'course/assessment/handles';
import QuestionFormOutlet from 'course/assessment/question/components/QuestionFormOutlet';
import { CourseContainer } from 'course/container';
import { forumHandle, forumTopicHandle } from 'course/forum/handles';
import { folderHandle } from 'course/material/folders/handles';
import materialLoader from 'course/material/materialLoader';
import { videoWatchHistoryHandle } from 'course/statistics/handles';
import { surveyHandle, surveyResponseHandle } from 'course/survey/handles';
import {
  courseUserHandle,
  courseUserPersonalizedTimelineHandle,
  manageUserHandles,
} from 'course/users/handles';
import videoAttemptLoader from 'course/video/attemptLoader';
import { videoHandle, videosHandle } from 'course/video/handles';
import CourselessContainer from 'lib/containers/CourselessContainer';
import useTranslation, { Translated } from 'lib/hooks/useTranslation';

import { reservedRoutes } from './redirects';
import createAppRouter from './router';

const authenticatedRouter: Translated<RouteObject[]> = (t) =>
  createAppRouter([
    {
      path: 'courses/:courseId',
      element: <CourseContainer />,
      loader: CourseContainer.loader,
      handle: CourseContainer.handle,
      shouldRevalidate: ({ currentParams, nextParams }): boolean => {
        const isChangingCourse = currentParams.courseId !== nextParams.courseId;

        // React Router's documentation never strictly mentioned that `shouldRevalidate`
        // should be a pure function, but a good software engineer would probably expect
        // it to be. Until we multi-course support in our Redux store, this is where
        // we can detect the `courseId` is changing without janky `useEffect`. It should
        // be safe since `resetStore` does not interfere with rendering or routing.
        if (isChangingCourse) resetStore();

        return isChangingCourse;
      },
      children: [
        {
          index: true,
          element: <CourseShow />,
        },
        {
          path: 'timelines',
          handle: TimelineDesigner.handle,
          element: <TimelineDesigner />,
        },
        {
          path: 'announcements',
          handle: AnnouncementsIndex.handle,
          element: <AnnouncementsIndex />,
        },
        {
          path: 'comments',
          handle: CommentIndex.handle,
          element: <CommentIndex />,
        },
        {
          path: 'leaderboard',
          handle: LeaderboardIndex.handle,
          element: <LeaderboardIndex />,
        },
        {
          path: 'learning_map',
          handle: LearningMap.handle,
          element: <LearningMap />,
        },
        {
          path: 'materials/folders',
          handle: folderHandle,
          // `:folderId` must be split this way so that `folderHandle` is matched
          // to the stable (non-changing) match of `/materials/folders`. This allows
          // the crumbs in the Workbin to not disappear when revalidated by the
          // Dynamic Nest API's builder.
          children: [
            {
              path: ':folderId',
              children: [
                {
                  index: true,
                  element: <FolderShow />,
                },
                {
                  path: 'files/:materialId',
                  loader: materialLoader(t),
                },
              ],
            },
          ],
        },
        {
          path: 'levels',
          handle: LevelsIndex.handle,
          element: <LevelsIndex />,
        },
        {
          path: 'statistics',
          handle: StatisticsIndex.handle,
          element: <StatisticsIndex />,
        },
        {
          path: 'duplication',
          handle: Duplication.handle,
          element: <Duplication />,
        },
        {
          path: 'enrol_requests',
          handle: manageUserHandles.enrolRequests,
          element: <UserRequests />,
        },
        {
          path: 'user_invitations',
          handle: manageUserHandles.invitations,
          element: <InvitationsIndex />,
        },
        {
          path: 'students',
          handle: manageUserHandles.students,
          element: <ManageStudents />,
        },
        {
          path: 'staff',
          handle: manageUserHandles.staff,
          element: <ManageStaff />,
        },
        {
          path: 'lesson_plan',
          // @ts-ignore `connect` throws error when cannot find `store` as direct parent
          element: <LessonPlanLayout />,
          handle: LessonPlanLayout.handle,
          children: [
            {
              index: true,
              element: <LessonPlanShow />,
            },
            {
              path: 'edit',
              element: <LessonPlanEdit />,
            },
          ],
        },
        {
          path: 'users',
          children: [
            {
              index: true,
              handle: UsersIndex.handle,
              element: <UsersIndex />,
            },
            {
              path: 'personal_times',
              handle: manageUserHandles.personalizedTimelines,
              element: <PersonalTimes />,
            },
            {
              path: 'invite',
              handle: manageUserHandles.inviteUsers,
              element: <InviteUsers />,
            },
            {
              path: 'disburse_experience_points',
              handle: DisbursementIndex.handle,
              element: <DisbursementIndex />,
            },
            {
              path: ':userId',
              handle: courseUserHandle,
              children: [
                {
                  index: true,
                  element: <CourseUserShow />,
                },
                {
                  path: 'experience_points_records',
                  handle: ExperiencePointsRecords.handle,
                  element: <ExperiencePointsRecords />,
                },
              ],
            },
            {
              path: ':userId/personal_times',
              handle: courseUserPersonalizedTimelineHandle,
              element: <PersonalTimesShow />,
            },
            {
              path: ':userId/video_submissions',
              handle: videoWatchHistoryHandle,
              element: <UserVideoSubmissionsIndex />,
            },
            {
              path: ':userId/manage_email_subscription',
              handle: UserEmailSubscriptions.handle,
              element: <UserEmailSubscriptions />,
            },
          ],
        },
        {
          path: 'admin',
          loader: SettingsNavigation.loader,
          handle: SettingsNavigation.handle,
          element: <SettingsNavigation />,
          children: [
            {
              index: true,
              element: <CourseSettings />,
            },
            {
              path: 'components',
              element: <ComponentSettings />,
            },
            {
              path: 'sidebar',
              element: <SidebarSettings />,
            },
            {
              path: 'notifications',
              element: <NotificationSettings />,
            },
            {
              path: 'announcements',
              element: <AnnouncementSettings />,
            },
            {
              path: 'assessments',
              element: <AssessmentSettings />,
            },
            {
              path: 'materials',
              element: <MaterialsSettings />,
            },
            {
              path: 'forums',
              element: <ForumsSettings />,
            },
            {
              path: 'leaderboard',
              element: <LeaderboardSettings />,
            },
            {
              path: 'comments',
              element: <CommentsSettings />,
            },
            {
              path: 'videos',
              element: <VideosSettings />,
            },
            {
              path: 'lesson_plan',
              element: <LessonPlanSettings />,
            },
            {
              path: 'codaveri',
              element: <CodaveriSettings />,
            },
          ],
        },
        {
          path: 'surveys',
          handle: SurveyIndex.handle,
          children: [
            {
              index: true,
              element: <SurveyIndex />,
            },
            {
              path: ':surveyId',
              handle: surveyHandle,
              children: [
                {
                  index: true,
                  element: <SurveyShow />,
                },
                {
                  path: 'results',
                  handle: SurveyResults.handle,
                  element: <SurveyResults />,
                },
                {
                  path: 'responses',
                  children: [
                    {
                      index: true,
                      handle: ResponseIndex.handle,
                      element: <ResponseIndex />,
                    },
                    {
                      path: ':responseId',
                      children: [
                        {
                          index: true,
                          handle: surveyResponseHandle,
                          element: <ResponseShow />,
                        },
                        {
                          path: 'edit',
                          handle: ResponseEdit.handle,
                          element: <ResponseEdit />,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          path: 'groups',
          element: <GroupIndex />,
          handle: GroupIndex.handle,
          children: [
            {
              path: ':groupCategoryId',
              element: <GroupShow />,
            },
          ],
        },
        {
          path: 'videos',
          handle: videosHandle,
          children: [
            {
              index: true,
              element: <VideosIndex />,
            },
            {
              path: ':videoId',
              handle: videoHandle,
              children: [
                {
                  index: true,
                  element: <VideoShow />,
                },
                {
                  path: 'submissions',
                  children: [
                    {
                      index: true,
                      handle: VideoSubmissionsIndex.handle,
                      element: <VideoSubmissionsIndex />,
                    },
                    {
                      path: ':submissionId',
                      handle: VideoSubmissionShow.handle,
                      children: [
                        {
                          index: true,
                          element: <VideoSubmissionShow />,
                        },
                        {
                          path: 'edit',
                          element: <VideoSubmissionEdit />,
                        },
                      ],
                    },
                  ],
                },
                {
                  path: 'attempt',
                  loader: videoAttemptLoader(t),
                },
              ],
            },
          ],
        },
        {
          path: 'forums',
          handle: ForumsIndex.handle,
          children: [
            {
              index: true,
              element: <ForumsIndex />,
            },
            {
              path: ':forumId',
              handle: forumHandle,
              children: [
                {
                  index: true,
                  element: <ForumShow />,
                },
                {
                  path: 'topics/:topicId',
                  handle: forumTopicHandle,
                  element: <ForumTopicShow />,
                },
              ],
            },
          ],
        },
        {
          path: 'achievements',
          handle: AchievementsIndex.handle,
          children: [
            {
              index: true,
              element: <AchievementsIndex />,
            },
            {
              path: ':achievementId',
              handle: achievementHandle,
              element: <AchievementShow />,
            },
          ],
        },
        {
          path: 'assessments',
          handle: assessmentsHandle,
          children: [
            {
              index: true,
              element: <AssessmentsIndex />,
            },
            {
              path: 'submissions',
              handle: SubmissionsIndex.handle,
              element: <SubmissionsIndex />,
            },
            {
              path: 'skills',
              handle: SkillsIndex.handle,
              element: <SkillsIndex />,
            },
            {
              path: ':assessmentId',
              handle: assessmentHandle,
              children: [
                {
                  index: true,
                  element: <AssessmentShow />,
                },
                {
                  path: 'edit',
                  handle: AssessmentEdit.handle,
                  element: <AssessmentEdit />,
                },
                {
                  path: 'attempt',
                  loader: assessmentAttemptLoader(t),
                },
                {
                  path: 'monitoring',
                  handle: AssessmentMonitoring.handle,
                  element: <AssessmentMonitoring />,
                },
                {
                  path: 'sessions/new',
                  element: <AssessmentSessionNew />,
                },
                {
                  path: 'statistics',
                  handle: AssessmentStatisticsPage.handle,
                  // @ts-ignore `connect` throws error when cannot find `store` as direct parent
                  element: <AssessmentStatisticsPage />,
                },
                {
                  path: 'submissions',
                  children: [
                    {
                      index: true,
                      handle: AssessmentSubmissionsIndex.handle,
                      element: <AssessmentSubmissionsIndex />,
                    },
                    {
                      path: ':submissionId',
                      children: [
                        {
                          path: 'edit',
                          handle: SubmissionEditIndex.handle,
                          element: <SubmissionEditIndex />,
                        },
                        {
                          path: 'logs',
                          handle: LogsIndex.handle,
                          element: <LogsIndex />,
                        },
                      ],
                    },
                  ],
                },
                {
                  path: 'question',
                  element: <QuestionFormOutlet />,
                  handle: questionHandle,
                  children: [
                    {
                      path: 'forum_post_responses',
                      children: [
                        {
                          path: 'new',
                          handle: NewForumPostResponsePage.handle,
                          element: <NewForumPostResponsePage />,
                        },
                        {
                          path: ':questionId/edit',
                          element: <EditForumPostResponsePage />,
                        },
                      ],
                    },
                    {
                      path: 'text_responses',
                      children: [
                        {
                          path: 'new',
                          handle: NewTextResponse.handle,
                          element: <NewTextResponse />,
                        },
                        {
                          path: ':questionId/edit',
                          element: <EditTextResponse />,
                        },
                      ],
                    },
                    {
                      path: 'voice_responses',
                      children: [
                        {
                          path: 'new',
                          handle: NewVoicePage.handle,
                          element: <NewVoicePage />,
                        },
                        {
                          path: ':questionId/edit',
                          element: <EditVoicePage />,
                        },
                      ],
                    },
                    {
                      path: 'multiple_responses',
                      children: [
                        {
                          path: 'new',
                          handle: NewMcqMrqPage.handle,
                          element: <NewMcqMrqPage />,
                        },
                        {
                          path: ':questionId/edit',
                          element: <EditMcqMrqPage />,
                        },
                      ],
                    },
                    {
                      path: 'scribing',
                      children: [
                        {
                          path: 'new',
                          handle: ScribingQuestion.handle,
                          element: <ScribingQuestion />,
                        },
                        {
                          path: ':questionId/edit',
                          element: <ScribingQuestion />,
                        },
                      ],
                    },
                    {
                      path: 'programming',
                      children: [
                        {
                          path: 'new',
                          handle: NewProgrammingQuestionPage.handle,
                          element: <NewProgrammingQuestionPage />,
                        },
                        {
                          path: ':questionId/edit',
                          element: <EditProgrammingQuestionPage />,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      path: '/',
      element: <CourselessContainer withGotoCoursesLink withUserMenu />,
      children: [
        {
          index: true,
          element: <DashboardPage />,
        },
      ],
    },
    {
      path: '*',
      element: <CourselessContainer withCourseSwitcher withUserMenu />,
      children: [
        reservedRoutes,
        {
          path: 'admin',
          handle: AdminNavigator.handle,
          element: <AdminNavigator />,
          children: [
            {
              index: true,
              element: <Navigate to="announcements" />,
            },
            {
              path: 'announcements',
              element: <AnnouncementIndex />,
            },
            {
              path: 'users',
              element: <UserIndex />,
            },
            {
              path: 'instances',
              element: <InstancesIndex />,
            },
            {
              path: 'courses',
              element: <CourseIndex />,
            },
          ],
        },
        {
          path: 'admin/instance',
          handle: InstanceAdminNavigator.handle,
          element: <InstanceAdminNavigator />,
          children: [
            {
              index: true,
              element: <Navigate to="announcements" />,
            },
            {
              path: 'announcements',
              element: <InstanceAnnouncementsIndex />,
            },
            {
              path: 'components',
              element: <InstanceComponentsIndex />,
            },
            {
              path: 'courses',
              element: <InstanceCoursesIndex />,
            },
            {
              path: 'users',
              element: <InstanceUsersIndex />,
            },
            {
              path: 'users/invite',
              element: <InstanceUsersInvite />,
            },
            {
              path: 'user_invitations',
              element: <InstanceUsersInvitations />,
            },
            {
              path: 'role_requests',
              element: <InstanceUserRoleRequestsIndex />,
            },
          ],
        },
        {
          path: 'announcements',
          handle: GlobalAnnouncementIndex.handle,
          element: <GlobalAnnouncementIndex />,
        },
        {
          path: 'users',
          children: [
            {
              path: 'masquerade',
              children: [
                {
                  index: true,
                  loader: masqueradeLoader(t),
                },
                {
                  path: 'back',
                  loader: stopMasqueradeLoader(t),
                },
              ],
            },
            {
              path: ':userId',
              element: <UserShow />,
            },
          ],
        },
        {
          path: 'user/profile/edit',
          handle: AccountSettings.handle,
          element: <AccountSettings />,
        },
        {
          path: 'role_requests',
          element: <Navigate to="/admin/instance/role_requests" />,
        },
      ],
    },
  ]);

const AuthenticatedApp = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <RouterProvider router={createBrowserRouter(authenticatedRouter(t))} />
  );
};

export default AuthenticatedApp;
