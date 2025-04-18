/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable sonarjs/no-duplicate-string */
import { memo } from 'react';
import { withAuthenticationRequired } from 'react-oidc-context';
import {
  createBrowserRouter,
  Navigate,
  RouteObject,
  RouterProvider,
} from 'react-router-dom';

import useTranslation, { Translated } from 'lib/hooks/useTranslation';

import { reservedRoutes } from './redirects';
import createAppRouter from './router';

const authenticatedRouter: Translated<RouteObject[]> = (t) =>
  createAppRouter([
    {
      path: 'courses/:courseId',
      lazy: async () => {
        const CourseContainer = (
          await import(
            /* webpackChunkName: 'CourseContainer' */
            'course/container/CourseContainer'
          )
        ).default;

        return {
          Component: CourseContainer,
          handle: CourseContainer.handle,
          loader: CourseContainer.loader,
        };
      },
      shouldRevalidate: ({ currentParams, nextParams }): boolean => {
        return currentParams.courseId !== nextParams.courseId;
      },
      children: [
        {
          index: true,
          lazy: async () => {
            const [CourseShow, LearnRedirect] = await Promise.all([
              import(
                /* webpackChunkName: 'CourseShow' */
                'course/courses/pages/CourseShow'
              ).then((module) => module.default),
              import(
                /* webpackChunkName: 'LearnRedirect' */
                'course/stories/components/LearnRedirect'
              ).then((module) => module.default),
            ]);

            return {
              element: (
                <LearnRedirect otherwiseRender={<CourseShow />} to="learn" />
              ),
            };
          },
        },
        {
          path: 'home',
          lazy: async () => ({
            Component: (
              await import(
                /* webpackChunkName: 'CourseShow' */
                'course/courses/pages/CourseShow'
              )
            ).default,
          }),
        },
        {
          path: 'learn',
          lazy: async () => {
            const LearnPage = (
              await import(
                /* webpackChunkName: 'LearnPage' */
                'course/stories/pages/LearnPage'
              )
            ).default;

            return {
              Component: LearnPage,
              handle: LearnPage.handle,
            };
          },
        },
        {
          path: 'mission_control',
          lazy: async () => {
            const MissionControlPage = (
              await import(
                /* webpackChunkName: 'MissionControlPage' */
                'course/stories/pages/MissionControlPage'
              )
            ).default;

            return {
              Component: MissionControlPage,
              handle: MissionControlPage.handle,
            };
          },
        },
        {
          path: 'timelines',
          lazy: async () => {
            const TimelineDesigner = (
              await import(
                /* webpackChunkName: 'TimelineDesigner' */
                'course/reference-timelines/TimelineDesigner'
              )
            ).default;

            return {
              Component: TimelineDesigner,
              handle: TimelineDesigner.handle,
            };
          },
        },
        {
          path: 'announcements',
          lazy: async () => {
            const [announcementsHandle, AnnouncementsIndex] = await Promise.all(
              [
                import(
                  /* webpackChunkName: 'announcementsHandle' */
                  'course/announcements/handles'
                ).then((module) => module.announcementsHandle),
                import(
                  /* webpackChunkName: 'AnnouncementsIndex' */
                  'course/announcements/pages/AnnouncementsIndex'
                ).then((module) => module.default),
              ],
            );

            return {
              Component: AnnouncementsIndex,
              handle: announcementsHandle,
            };
          },
        },
        {
          path: 'comments',
          lazy: async () => {
            const [commentHandle, CommentIndex] = await Promise.all([
              import(
                /* webpackChunkName: 'commentHandle' */
                'course/discussion/topics/handles'
              ).then((module) => module.commentHandle),
              import(
                /* webpackChunkName: 'CommentIndex' */
                'course/discussion/topics/pages/CommentIndex'
              ).then((module) => module.default),
            ]);

            return {
              Component: CommentIndex,
              handle: commentHandle,
            };
          },
        },
        {
          path: 'leaderboard',
          lazy: async () => {
            const [leaderboardHandle, LeaderboardIndex] = await Promise.all([
              import(
                /* webpackChunkName: 'leaderboardHandle' */
                'course/leaderboard/handles'
              ).then((module) => module.leaderboardHandle),
              import(
                /* webpackChunkName: 'LeaderboardIndex' */
                'course/leaderboard/pages/LeaderboardIndex'
              ).then((module) => module.default),
            ]);

            return {
              Component: LeaderboardIndex,
              handle: leaderboardHandle,
            };
          },
        },
        {
          path: 'learning_map',
          lazy: async () => ({
            Component: (
              await import(
                /* webpackChunkName: 'LearningMap' */
                'course/learning-map/containers/LearningMap'
              )
            ).default,
          }),
        },
        {
          path: 'materials/folders',
          lazy: async () => ({
            handle: (
              await import(
                /* webpackChunkName: 'folderHandle' */
                'course/material/folders/handles'
              )
            ).folderHandle,
          }),
          // `:folderId` must be split this way so that `folderHandle` is matched
          // to the stable (non-changing) match of `/materials/folders`. This allows
          // the crumbs in the Workbin to not disappear when revalidated by the
          // Dynamic Nest API's builder.
          children: [
            {
              index: true,
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'FolderShow' */
                    'course/material/folders/pages/FolderShow'
                  )
                ).default,
              }),
            },
            {
              path: ':folderId',
              children: [
                {
                  index: true,
                  lazy: async () => ({
                    Component: (
                      await import(
                        /* webpackChunkName: 'FolderShow' */
                        'course/material/folders/pages/FolderShow'
                      )
                    ).default,
                  }),
                },
                {
                  path: 'files/:materialId',
                  lazy: async () => {
                    const [
                      materialLoader,
                      ErrorRetrievingFilePage,
                      DownloadingFilePage,
                    ] = await Promise.all([
                      import(
                        /* webpackChunkName: 'materialLoader' */
                        'course/material/materialLoader'
                      ).then((module) => module.default),
                      import(
                        /* webpackChunkName: 'ErrorRetrievingFilePage' */
                        'course/material/files/ErrorRetrievingFilePage'
                      ).then((module) => module.default),
                      import(
                        /* webpackChunkName: 'DownloadingFilePage' */
                        'course/material/files/DownloadingFilePage'
                      ).then((module) => module.default),
                    ]);

                    return {
                      loader: materialLoader,
                      errorElement: <ErrorRetrievingFilePage />,
                      element: <DownloadingFilePage />,
                    };
                  },
                },
              ],
            },
          ],
        },
        {
          path: 'levels',
          lazy: async () => {
            const LevelsIndex = (
              await import(
                /* webpackChunkName: 'LevelsIndex' */
                'course/level/pages/LevelsIndex'
              )
            ).default;

            return {
              Component: LevelsIndex,
              handle: LevelsIndex.handle,
            };
          },
        },
        {
          path: 'statistics',
          lazy: async () => {
            const StatisticsIndex = (
              await import(
                /* webpackChunkName: 'StatisticsIndex' */
                'course/statistics/pages/StatisticsIndex'
              )
            ).default;

            return {
              Component: StatisticsIndex,
              handle: StatisticsIndex.handle,
            };
          },
          children: [
            {
              path: 'students',
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'StudentsStatistics' */
                    'course/statistics/pages/StatisticsIndex/students/StudentsStatistics'
                  )
                ).default,
              }),
            },
            {
              path: 'staff',
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'StaffStatistics' */
                    'course/statistics/pages/StatisticsIndex/staff/StaffStatistics'
                  )
                ).default,
              }),
            },
            {
              path: 'course',
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'CourseStatistics' */
                    'course/statistics/pages/StatisticsIndex/course/CourseStatistics'
                  )
                ).default,
              }),
            },
            {
              path: 'assessments',
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'CourseStatistics' */
                    'course/statistics/pages/StatisticsIndex/assessments/AssessmentsStatistics'
                  )
                ).default,
              }),
            },
          ],
        },
        {
          path: 'duplication',
          lazy: async () => {
            const Duplication = (
              await import(
                /* webpackChunkName: 'Duplication' */
                'course/duplication/pages/Duplication'
              )
            ).default;

            return {
              Component: Duplication,
              handle: Duplication.handle,
            };
          },
        },
        {
          path: 'enrol_requests',
          lazy: async () => {
            const [manageUserHandles, UserRequests] = await Promise.all([
              import(
                /* webpackChunkName: 'userHandles' */
                'course/users/handles'
              ).then((module) => module.manageUserHandles),
              import(
                /* webpackChunkName: 'UserRequests' */
                'course/enrol-requests/pages/UserRequests'
              ).then((module) => module.default),
            ]);

            return {
              Component: UserRequests,
              handle: manageUserHandles.enrolRequests,
            };
          },
        },
        {
          path: 'user_invitations',
          lazy: async () => {
            const [manageUserHandles, UserRequests] = await Promise.all([
              import(
                /* webpackChunkName: 'userHandles' */
                'course/users/handles'
              ).then((module) => module.manageUserHandles),
              import(
                /* webpackChunkName: 'InvitationsIndex' */
                'course/user-invitations/pages/InvitationsIndex'
              ).then((module) => module.default),
            ]);

            return {
              Component: UserRequests,
              handle: manageUserHandles.invitations,
            };
          },
        },
        {
          path: 'students',
          lazy: async () => {
            const [manageUserHandles, UserRequests] = await Promise.all([
              import(
                /* webpackChunkName: 'userHandles' */
                'course/users/handles'
              ).then((module) => module.manageUserHandles),
              import(
                /* webpackChunkName: 'ManageStudents' */
                'course/users/pages/ManageStudents'
              ).then((module) => module.default),
            ]);

            return {
              Component: UserRequests,
              handle: manageUserHandles.students,
            };
          },
        },
        {
          path: 'staff',
          lazy: async () => {
            const [manageUserHandles, UserRequests] = await Promise.all([
              import(
                /* webpackChunkName: 'userHandles' */
                'course/users/handles'
              ).then((module) => module.manageUserHandles),
              import(
                /* webpackChunkName: 'ManageStaff' */
                'course/users/pages/ManageStaff'
              ).then((module) => module.default),
            ]);

            return {
              Component: UserRequests,
              handle: manageUserHandles.staff,
            };
          },
        },
        {
          path: 'lesson_plan',
          lazy: async () => {
            const LessonPlanLayout = (
              await import(
                /* webpackChunkName: 'LessonPlanLayout' */
                'course/lesson-plan/containers/LessonPlanLayout'
              )
            ).default;

            return {
              // @ts-ignore `connect` throws error when cannot find `store` as direct parent
              element: <LessonPlanLayout />,
              handle: LessonPlanLayout.handle,
            };
          },
          children: [
            {
              index: true,
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'LessonPlanShow' */
                    'course/lesson-plan/pages/LessonPlanShow'
                  )
                ).default,
              }),
            },
            {
              path: 'edit',
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'LessonPlanEdit' */
                    'course/lesson-plan/pages/LessonPlanEdit'
                  )
                ).default,
              }),
            },
          ],
        },
        {
          path: 'experience_points_records',
          lazy: async () => {
            const ExperiencePointsIndex = (
              await import(
                /* webpackChunkName: 'ExperiencePointsIndex' */
                'course/experience-points'
              )
            ).default;

            return {
              Component: ExperiencePointsIndex,
              handle: ExperiencePointsIndex.handle,
            };
          },
        },
        {
          path: 'users',
          children: [
            {
              index: true,
              lazy: async () => {
                const UsersIndex = (
                  await import(
                    /* webpackChunkName: 'UsersIndex' */
                    'course/users/pages/UsersIndex'
                  )
                ).default;

                return {
                  Component: UsersIndex,
                  handle: UsersIndex.handle,
                };
              },
            },
            {
              path: 'personal_times',
              lazy: async () => {
                const [manageUserHandles, PersonalTimes] = await Promise.all([
                  import(
                    /* webpackChunkName: 'userHandles' */
                    'course/users/handles'
                  ).then((module) => module.manageUserHandles),
                  import(
                    /* webpackChunkName: 'PersonalTimes' */
                    'course/users/pages/PersonalTimes'
                  ).then((module) => module.default),
                ]);

                return {
                  Component: PersonalTimes,
                  handle: manageUserHandles.personalizedTimelines,
                };
              },
            },
            {
              path: 'invite',
              lazy: async () => {
                const [manageUserHandles, InviteUsers] = await Promise.all([
                  import(
                    /* webpackChunkName: 'userHandles' */
                    'course/users/handles'
                  ).then((module) => module.manageUserHandles),
                  import(
                    /* webpackChunkName: 'InviteUsers' */
                    'course/user-invitations/pages/InviteUsers'
                  ).then((module) => module.default),
                ]);

                return {
                  Component: InviteUsers,
                  handle: manageUserHandles.inviteUsers,
                };
              },
            },
            {
              path: ':userId',
              lazy: async () => ({
                handle: await import(
                  /* webpackChunkName: 'userHandles' */
                  'course/users/handles'
                ).then((module) => module.courseUserHandle),
              }),
              children: [
                {
                  index: true,
                  lazy: async () => ({
                    Component: (
                      await import(
                        /* webpackChunkName: 'CourseUserShow' */
                        'course/users/pages/UserShow'
                      )
                    ).default,
                  }),
                },
                {
                  path: 'experience_points_records',
                  lazy: async () => {
                    const ExperiencePointsRecords = (
                      await import(
                        /* webpackChunkName: 'ExperiencePointsRecords' */
                        'course/users/pages/ExperiencePointsRecords'
                      )
                    ).default;

                    return {
                      Component: ExperiencePointsRecords,
                      handle: ExperiencePointsRecords.handle,
                    };
                  },
                },
              ],
            },
            {
              path: ':userId/personal_times',
              lazy: async () => {
                const [courseUserPersonalizedTimelineHandle, InviteUsers] =
                  await Promise.all([
                    import(
                      /* webpackChunkName: 'userHandles' */
                      'course/users/handles'
                    ).then(
                      (module) => module.courseUserPersonalizedTimelineHandle,
                    ),
                    import(
                      /* webpackChunkName: 'PersonalTimesShow' */
                      'course/users/pages/PersonalTimesShow'
                    ).then((module) => module.default),
                  ]);

                return {
                  Component: InviteUsers,
                  handle: courseUserPersonalizedTimelineHandle,
                };
              },
            },
            {
              path: ':userId/video_submissions',
              lazy: async () => {
                const [videoWatchHistoryHandle, UserVideoSubmissionsIndex] =
                  await Promise.all([
                    import(
                      /* webpackChunkName: 'videoWatchHistoryHandle' */
                      'course/statistics/handles'
                    ).then((module) => module.videoWatchHistoryHandle),
                    import(
                      /* webpackChunkName: 'UserVideoSubmissionsIndex' */
                      'course/video-submissions/pages/UserVideoSubmissionsIndex'
                    ).then((module) => module.default),
                  ]);

                return {
                  Component: UserVideoSubmissionsIndex,
                  handle: videoWatchHistoryHandle,
                };
              },
            },
            {
              path: ':userId/manage_email_subscription',
              lazy: async () => {
                const UserEmailSubscriptions = (
                  await import(
                    /* webpackChunkName: 'UserEmailSubscriptions' */
                    'course/user-email-subscriptions/UserEmailSubscriptions'
                  )
                ).default;

                return {
                  Component: UserEmailSubscriptions,
                  handle: UserEmailSubscriptions.handle,
                };
              },
            },
          ],
        },
        {
          path: 'admin',
          lazy: async () => {
            const SettingsNavigation = (
              await import(
                /* webpackChunkName: 'SettingsNavigation' */
                'course/admin/components/SettingsNavigation'
              )
            ).default;

            return {
              Component: SettingsNavigation,
              handle: SettingsNavigation.handle,
              loader: SettingsNavigation.loader,
            };
          },
          children: [
            {
              index: true,
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'CourseSettings' */
                    'course/admin/pages/CourseSettings'
                  )
                ).default,
              }),
            },
            {
              path: 'components',
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'ComponentSettings' */
                    'course/admin/pages/ComponentSettings'
                  )
                ).default,
              }),
            },
            {
              path: 'sidebar',
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'SidebarSettings' */
                    'course/admin/pages/SidebarSettings'
                  )
                ).default,
              }),
            },
            {
              path: 'notifications',
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'NotificationSettings' */
                    'course/admin/pages/NotificationSettings'
                  )
                ).default,
              }),
            },
            {
              path: 'announcements',
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'AnnouncementsSettings' */
                    'course/admin/pages/AnnouncementsSettings'
                  )
                ).default,
              }),
            },
            {
              path: 'assessments',
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'AssessmentSettings' */
                    'course/admin/pages/AssessmentSettings'
                  )
                ).default,
              }),
            },
            {
              path: 'materials',
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'MaterialsSettings' */
                    'course/admin/pages/MaterialsSettings'
                  )
                ).default,
              }),
            },
            {
              path: 'forums',
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'ForumsSettings' */
                    'course/admin/pages/ForumsSettings'
                  )
                ).default,
              }),
            },
            {
              path: 'leaderboard',
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'LeaderboardSettings' */
                    'course/admin/pages/LeaderboardSettings'
                  )
                ).default,
              }),
            },
            {
              path: 'comments',
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'CommentsSettings' */
                    'course/admin/pages/CommentsSettings'
                  )
                ).default,
              }),
            },
            {
              path: 'videos',
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'VideosSettings' */
                    'course/admin/pages/VideosSettings'
                  )
                ).default,
              }),
            },
            {
              path: 'lesson_plan',
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'LessonPlanSettings' */
                    'course/admin/pages/LessonPlanSettings'
                  )
                ).default,
              }),
            },
            {
              path: 'codaveri',
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'CodaveriSettings' */
                    'course/admin/pages/CodaveriSettings'
                  )
                ).default,
              }),
            },
            {
              path: 'stories',
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'StoriesSettings' */
                    'course/admin/pages/StoriesSettings'
                  )
                ).default,
              }),
            },
            {
              path: 'rag_wise',
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'RagWiseSettings' */
                    'course/admin/pages/RagWiseSettings'
                  )
                ).default,
              }),
            },
          ],
        },
        {
          path: 'surveys',
          lazy: async () => ({
            handle: (
              await import(
                /* webpackChunkName: 'SurveyIndex' */
                'course/survey/pages/SurveyIndex'
              )
            ).default.handle,
          }),
          children: [
            {
              index: true,
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'SurveyIndex' */
                    'course/survey/pages/SurveyIndex'
                  )
                ).default,
              }),
            },
            {
              path: ':surveyId',
              lazy: async () => ({
                handle: (
                  await import(
                    /* webpackChunkName: 'surveyHandles' */
                    'course/survey/handles'
                  )
                ).surveyHandle,
              }),
              children: [
                {
                  index: true,
                  lazy: async () => ({
                    Component: (
                      await import(
                        /* webpackChunkName: 'SurveyShow' */
                        'course/survey/pages/SurveyShow'
                      )
                    ).default,
                  }),
                },
                {
                  path: 'results',
                  lazy: async () => {
                    const SurveyResults = (
                      await import(
                        /* webpackChunkName: 'SurveyResults' */
                        'course/survey/pages/SurveyResults'
                      )
                    ).default;

                    return {
                      Component: SurveyResults,
                      handle: SurveyResults.handle,
                    };
                  },
                },
                {
                  path: 'responses',
                  children: [
                    {
                      index: true,
                      lazy: async () => {
                        const ResponseIndex = (
                          await import(
                            /* webpackChunkName: 'ResponseIndex' */
                            'course/survey/pages/ResponseIndex'
                          )
                        ).default;

                        return {
                          Component: ResponseIndex,
                          handle: ResponseIndex.handle,
                        };
                      },
                    },
                    {
                      path: ':responseId',
                      children: [
                        {
                          index: true,
                          lazy: async () => {
                            const [surveyResponseHandle, ResponseShow] =
                              await Promise.all([
                                import(
                                  /* webpackChunkName: 'surveyHandles' */
                                  'course/survey/handles'
                                ).then((module) => module.surveyResponseHandle),
                                import(
                                  /* webpackChunkName: 'ResponseShow' */
                                  'course/survey/pages/ResponseShow'
                                ).then((module) => module.default),
                              ]);

                            return {
                              Component: ResponseShow,
                              handle: surveyResponseHandle,
                            };
                          },
                        },
                        {
                          path: 'edit',
                          lazy: async () => ({
                            Component: (
                              await import(
                                /* webpackChunkName: 'ResponseEdit' */
                                'course/survey/pages/ResponseEdit'
                              )
                            ).default,
                          }),
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
          lazy: async () => {
            const GroupIndex = (
              await import(
                /* webpackChunkName: 'GroupIndex' */
                'course/group/pages/GroupIndex'
              )
            ).default;

            return {
              Component: GroupIndex,
              handle: GroupIndex.handle,
            };
          },
          children: [
            {
              path: ':groupCategoryId',
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'GroupShow' */
                    'course/group/pages/GroupShow'
                  )
                ).default,
              }),
            },
          ],
        },
        {
          path: 'videos',
          lazy: async () => ({
            handle: (
              await import(
                /* webpackChunkName: 'videoHandles' */
                'course/video/handles'
              )
            ).videosHandle,
          }),
          children: [
            {
              index: true,
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'VideosIndex' */
                    'course/video/pages/VideosIndex'
                  )
                ).default,
              }),
            },
            {
              path: ':videoId',
              lazy: async () => ({
                handle: (
                  await import(
                    /* webpackChunkName: 'videoHandles' */
                    'course/video/handles'
                  )
                ).videoHandle,
              }),
              children: [
                {
                  index: true,
                  lazy: async () => ({
                    Component: (
                      await import(
                        /* webpackChunkName: 'VideoShow' */
                        'course/video/pages/VideoShow'
                      )
                    ).default,
                  }),
                },
                {
                  path: 'submissions',
                  children: [
                    {
                      index: true,
                      lazy: async () => {
                        const VideoSubmissionsIndex = (
                          await import(
                            /* webpackChunkName: 'VideoSubmissionsIndex' */
                            'course/video/submission/pages/VideoSubmissionsIndex'
                          )
                        ).default;

                        return {
                          Component: VideoSubmissionsIndex,
                          handle: VideoSubmissionsIndex.handle,
                        };
                      },
                    },
                    {
                      path: ':submissionId',
                      lazy: async () => ({
                        handle: (
                          await import(
                            /* webpackChunkName: 'VideoSubmissionShow' */
                            'course/video/submission/pages/VideoSubmissionShow'
                          )
                        ).default.handle,
                      }),
                      children: [
                        {
                          index: true,
                          lazy: async () => ({
                            Component: (
                              await import(
                                /* webpackChunkName: 'VideoSubmissionShow' */
                                'course/video/submission/pages/VideoSubmissionShow'
                              )
                            ).default,
                          }),
                        },
                        {
                          path: 'edit',
                          lazy: async () => ({
                            Component: (
                              await import(
                                /* webpackChunkName: 'VideoSubmissionEdit' */
                                'course/video/submission/pages/VideoSubmissionEdit'
                              )
                            ).default,
                          }),
                        },
                      ],
                    },
                  ],
                },
                {
                  path: 'attempt',
                  lazy: async () => {
                    const videoAttemptLoader = (
                      await import(
                        /* webpackChunkName: 'videoAttemptLoader' */
                        'course/video/attemptLoader'
                      )
                    ).default;

                    return { loader: videoAttemptLoader(t) };
                  },
                },
              ],
            },
          ],
        },
        {
          path: 'forums',
          lazy: async () => ({
            handle: (
              await import(
                /* webpackChunkName: 'forumHandles' */
                'course/forum/handles'
              )
            ).forumHandle,
          }),
          children: [
            {
              index: true,
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'ForumsIndex' */
                    'course/forum/pages/ForumsIndex'
                  )
                ).default,
              }),
            },
            {
              path: ':forumId',
              lazy: async () => ({
                handle: (
                  await import(
                    /* webpackChunkName: 'forumHandles' */
                    'course/forum/handles'
                  )
                ).forumNameHandle,
              }),
              children: [
                {
                  index: true,
                  lazy: async () => ({
                    Component: (
                      await import(
                        /* webpackChunkName: 'ForumShow' */
                        'course/forum/pages/ForumShow'
                      )
                    ).default,
                  }),
                },
                {
                  path: 'topics/:topicId',
                  lazy: async () => {
                    const [forumTopicHandle, ForumTopicShow] =
                      await Promise.all([
                        import(
                          /* webpackChunkName: 'forumHandles' */
                          'course/forum/handles'
                        ).then((module) => module.forumTopicHandle),
                        import(
                          /* webpackChunkName: 'ForumTopicShow' */
                          'course/forum/pages/ForumTopicShow'
                        ).then((module) => module.default),
                      ]);

                    return {
                      Component: ForumTopicShow,
                      handle: forumTopicHandle,
                    };
                  },
                },
              ],
            },
          ],
        },
        {
          path: 'achievements',
          lazy: async () => ({
            handle: (
              await import(
                /* webpackChunkName: 'AchievementsIndex' */
                'course/achievement/pages/AchievementsIndex'
              )
            ).default.handle,
          }),
          children: [
            {
              index: true,
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'AchievementsIndex' */
                    'course/achievement/pages/AchievementsIndex'
                  )
                ).default,
              }),
            },
            {
              path: ':achievementId',
              lazy: async () => {
                const [achievementHandle, AchievementShow] = await Promise.all([
                  import(
                    /* webpackChunkName: 'achievementHandle' */
                    'course/achievement/handles'
                  ).then((module) => module.achievementHandle),
                  import(
                    /* webpackChunkName: 'AchievementShow' */
                    'course/achievement/pages/AchievementShow'
                  ).then((module) => module.default),
                ]);

                return {
                  Component: AchievementShow,
                  handle: achievementHandle,
                };
              },
            },
          ],
        },
        {
          path: 'assessments',
          lazy: async () => ({
            handle: (
              await import(
                /* webpackChunkName: 'assessmentHandles' */
                'course/assessment/handles'
              )
            ).assessmentsHandle,
          }),
          children: [
            {
              index: true,
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'AssessmentsIndex' */
                    'bundles/course/assessment/pages/AssessmentsIndex'
                  )
                ).default,
              }),
            },
            {
              path: 'submissions',
              lazy: async () => {
                const SubmissionsIndex = (
                  await import(
                    /* webpackChunkName: 'SubmissionsIndex' */
                    'course/assessment/submissions/SubmissionsIndex'
                  )
                ).default;

                return {
                  Component: SubmissionsIndex,
                  handle: SubmissionsIndex.handle,
                };
              },
            },
            {
              path: 'skills',
              lazy: async () => {
                const SkillsIndex = (
                  await import(
                    /* webpackChunkName: 'SkillsIndex' */
                    'course/assessment/skills/pages/SkillsIndex'
                  )
                ).default;

                return {
                  Component: SkillsIndex,
                  handle: SkillsIndex.handle,
                };
              },
            },
            {
              path: ':assessmentId',
              lazy: async () => ({
                handle: (
                  await import(
                    /* webpackChunkName: 'assessmentHandles' */
                    'course/assessment/handles'
                  )
                ).assessmentHandle,
              }),
              children: [
                {
                  index: true,
                  lazy: async () => ({
                    Component: (
                      await import(
                        /* webpackChunkName: 'AssessmentShow' */
                        'course/assessment/pages/AssessmentShow'
                      )
                    ).default,
                  }),
                },
                {
                  path: 'edit',
                  lazy: async () => {
                    const AssessmentEdit = (
                      await import(
                        /* webpackChunkName: 'AssessmentEdit' */
                        'course/assessment/pages/AssessmentEdit'
                      )
                    ).default;

                    return {
                      Component: AssessmentEdit,
                      handle: AssessmentEdit.handle,
                    };
                  },
                },
                {
                  path: 'attempt',
                  lazy: async () => {
                    const assessmentAttemptLoader = (
                      await import(
                        /* webpackChunkName: 'assessmentAttemptLoader' */
                        'course/assessment/attemptLoader'
                      )
                    ).default;

                    return { loader: assessmentAttemptLoader(t) };
                  },
                },
                {
                  path: 'monitoring',
                  lazy: async () => {
                    const AssessmentMonitoring = (
                      await import(
                        /* webpackChunkName: 'AssessmentMonitoring' */
                        'course/assessment/pages/AssessmentMonitoring'
                      )
                    ).default;

                    return {
                      Component: AssessmentMonitoring,
                      handle: AssessmentMonitoring.handle,
                    };
                  },
                },
                {
                  path: 'sessions/new',
                  lazy: async () => ({
                    Component: (
                      await import(
                        /* webpackChunkName: 'AssessmentSessionNew' */
                        'course/assessment/sessions/pages/AssessmentSessionNew'
                      )
                    ).default,
                  }),
                },
                {
                  path: 'statistics',
                  lazy: async () => {
                    const AssessmentStatistics = (
                      await import(
                        /* webpackChunkName: 'AssessmentStatistics' */
                        'course/assessment/pages/AssessmentStatistics'
                      )
                    ).default;

                    return {
                      Component: AssessmentStatistics,
                      handle: AssessmentStatistics.handle,
                    };
                  },
                },
                {
                  path: 'submissions',
                  children: [
                    {
                      index: true,
                      lazy: async () => {
                        const AssessmentSubmissionsIndex = (
                          await import(
                            /* webpackChunkName: 'AssessmentSubmissionsIndex' */
                            'course/assessment/submission/pages/SubmissionsIndex'
                          )
                        ).default;

                        return {
                          Component: AssessmentSubmissionsIndex,
                          handle: AssessmentSubmissionsIndex.handle,
                        };
                      },
                    },
                    {
                      path: ':submissionId',
                      children: [
                        {
                          path: 'edit',
                          lazy: async () => {
                            const SubmissionEditIndex = (
                              await import(
                                /* webpackChunkName: 'SubmissionEditIndex' */
                                'course/assessment/submission/pages/SubmissionEditIndex'
                              )
                            ).default;

                            return {
                              Component: SubmissionEditIndex,
                              handle: SubmissionEditIndex.handle,
                            };
                          },
                        },
                        {
                          path: 'logs',
                          lazy: async () => {
                            const SubmissionLogs = (
                              await import(
                                /* webpackChunkName: 'SubmissionLogs' */
                                'course/assessment/submission/pages/LogsIndex'
                              )
                            ).default;

                            return {
                              Component: SubmissionLogs,
                              handle: SubmissionLogs.handle,
                            };
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  path: 'question',
                  lazy: async () => {
                    const [questionHandle, QuestionFormOutlet] =
                      await Promise.all([
                        import(
                          /* webpackChunkName: 'assessmentHandles' */
                          'course/assessment/handles'
                        ).then((module) => module.questionHandle),
                        import(
                          /* webpackChunkName: 'QuestionFormOutlet' */
                          'course/assessment/question/components/QuestionFormOutlet'
                        ).then((module) => module.default),
                      ]);

                    return {
                      Component: QuestionFormOutlet,
                      handle: questionHandle,
                    };
                  },
                  children: [
                    {
                      path: 'forum_post_responses',
                      children: [
                        {
                          path: 'new',
                          lazy: async () => {
                            const NewForumPostResponsePage = (
                              await import(
                                /* webpackChunkName: 'NewForumPostResponsePage' */
                                'course/assessment/question/forum-post-responses/NewForumPostResponsePage'
                              )
                            ).default;

                            return {
                              Component: NewForumPostResponsePage,
                              handle: NewForumPostResponsePage.handle,
                            };
                          },
                        },
                        {
                          path: ':questionId/edit',
                          lazy: async () => ({
                            Component: (
                              await import(
                                /* webpackChunkName: 'EditForumPostResponsePage' */
                                'course/assessment/question/forum-post-responses/EditForumPostResponsePage'
                              )
                            ).default,
                          }),
                        },
                      ],
                    },
                    {
                      path: 'text_responses',
                      children: [
                        {
                          path: 'new',
                          lazy: async () => {
                            const NewTextResponse = (
                              await import(
                                /* webpackChunkName: 'NewTextResponsePage' */
                                'course/assessment/question/text-responses/NewTextResponsePage'
                              )
                            ).default;

                            return {
                              Component: NewTextResponse,
                              handle: NewTextResponse.handle,
                            };
                          },
                        },
                        {
                          path: ':questionId/edit',
                          lazy: async () => ({
                            Component: (
                              await import(
                                /* webpackChunkName: 'EditTextResponsePage' */
                                'course/assessment/question/text-responses/EditTextResponsePage'
                              )
                            ).default,
                          }),
                        },
                      ],
                    },
                    {
                      path: 'voice_responses',
                      children: [
                        {
                          path: 'new',
                          lazy: async () => {
                            const NewVoicePage = (
                              await import(
                                /* webpackChunkName: 'NewVoicePage' */
                                'course/assessment/question/voice-responses/NewVoicePage'
                              )
                            ).default;

                            return {
                              Component: NewVoicePage,
                              handle: NewVoicePage.handle,
                            };
                          },
                        },
                        {
                          path: ':questionId/edit',
                          lazy: async () => ({
                            Component: (
                              await import(
                                /* webpackChunkName: 'EditVoicePage' */
                                'course/assessment/question/voice-responses/EditVoicePage'
                              )
                            ).default,
                          }),
                        },
                      ],
                    },
                    {
                      path: 'multiple_responses',
                      children: [
                        {
                          path: 'new',
                          lazy: async () => {
                            const NewMcqMrqPage = (
                              await import(
                                /* webpackChunkName: 'NewMcqMrqPage' */
                                'course/assessment/question/multiple-responses/NewMcqMrqPage'
                              )
                            ).default;

                            return {
                              Component: NewMcqMrqPage,
                              handle: NewMcqMrqPage.handle,
                            };
                          },
                        },
                        {
                          path: ':questionId/edit',
                          lazy: async () => ({
                            Component: (
                              await import(
                                /* webpackChunkName: 'EditMcqMrqPage' */
                                'course/assessment/question/multiple-responses/EditMcqMrqPage'
                              )
                            ).default,
                          }),
                        },
                      ],
                    },
                    {
                      path: 'scribing',
                      children: [
                        {
                          path: 'new',
                          lazy: async () => {
                            const ScribingQuestion = (
                              await import(
                                /* webpackChunkName: 'ScribingQuestion' */
                                'course/assessment/question/scribing/ScribingQuestion'
                              )
                            ).default;

                            return {
                              Component: ScribingQuestion,
                              handle: ScribingQuestion.handle,
                            };
                          },
                        },
                        {
                          path: ':questionId/edit',
                          lazy: async () => ({
                            Component: (
                              await import(
                                /* webpackChunkName: 'ScribingQuestion' */
                                'course/assessment/question/scribing/ScribingQuestion'
                              )
                            ).default,
                          }),
                        },
                      ],
                    },
                    {
                      path: 'rubric_based_responses',
                      children: [
                        {
                          path: 'new',
                          lazy: async () => {
                            const NewRubricBasedResponsePage = (
                              await import(
                                /* webpackChunkName: NewRubricBasedResponsePage */
                                'course/assessment/question/rubric-based-responses/NewRubricBasedResponsePage'
                              )
                            ).default;

                            return {
                              Component: NewRubricBasedResponsePage,
                              handle: NewRubricBasedResponsePage.handle,
                            };
                          },
                        },
                        {
                          path: ':questionId/edit',
                          lazy: async () => ({
                            Component: (
                              await import(
                                /* webpackChunkName: EditRubricBasedResponsePage */
                                'course/assessment/question/rubric-based-responses/EditRubricBasedResponsePage'
                              )
                            ).default,
                          }),
                        },
                      ],
                    },
                    {
                      path: 'programming',
                      children: [
                        {
                          path: 'new',
                          lazy: async () => {
                            const NewProgrammingQuestionPage = (
                              await import(
                                /* webpackChunkName: 'NewProgrammingQuestionPage' */
                                'course/assessment/question/programming/NewProgrammingQuestionPage'
                              )
                            ).default;

                            return {
                              Component: NewProgrammingQuestionPage,
                              handle: NewProgrammingQuestionPage.handle,
                            };
                          },
                        },
                        {
                          path: 'generate',
                          lazy: async () => {
                            const GenerateProgrammingQuestionPage = (
                              await import(
                                /* webpackChunkName: 'GenerateProgrammingQuestionPage' */
                                'course/assessment/pages/AssessmentGenerate/GenerateProgrammingQuestionPage'
                              )
                            ).default;

                            return {
                              Component: GenerateProgrammingQuestionPage,
                              handle: GenerateProgrammingQuestionPage.handle,
                            };
                          },
                        },
                        {
                          path: ':questionId/edit',
                          lazy: async () => ({
                            Component: (
                              await import(
                                /* webpackChunkName: 'EditProgrammingQuestionPage' */
                                'course/assessment/question/programming/EditProgrammingQuestionPage'
                              )
                            ).default,
                          }),
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
      lazy: async () => {
        const CourselessContainer = (
          await import(
            /* webpackChunkName: 'CourselessContainer' */
            'lib/containers/CourselessContainer'
          )
        ).default;

        return {
          element: <CourselessContainer withGotoCoursesLink withUserMenu />,
        };
      },
      children: [
        {
          index: true,
          lazy: async () => ({
            Component: (
              await import(
                /* webpackChunkName: 'DashboardPage' */
                'bundles/common/DashboardPage'
              )
            ).default,
          }),
        },
      ],
    },
    {
      path: '*',
      lazy: async () => {
        const CourselessContainer = (
          await import(
            /* webpackChunkName: 'CourselessContainer' */
            'lib/containers/CourselessContainer'
          )
        ).default;

        return {
          element: <CourselessContainer withCourseSwitcher withUserMenu />,
        };
      },

      children: [
        reservedRoutes,
        {
          path: 'admin',
          lazy: async () => {
            const AdminNavigator = (
              await import(
                /* webpackChunkName: 'AdminNavigator' */
                'bundles/system/admin/admin/AdminNavigator'
              )
            ).default;

            return {
              Component: AdminNavigator,
              handle: AdminNavigator.handle,
            };
          },
          children: [
            {
              index: true,
              element: <Navigate to="announcements" />,
            },
            {
              path: 'announcements',
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'AnnouncementsIndex' */
                    'bundles/system/admin/admin/pages/AnnouncementsIndex'
                  )
                ).default,
              }),
            },
            {
              path: 'users',
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'UsersIndex' */
                    'bundles/system/admin/admin/pages/UsersIndex'
                  )
                ).default,
              }),
            },
            {
              path: 'instances',
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'InstancesIndex' */
                    'bundles/system/admin/admin/pages/InstancesIndex'
                  )
                ).default,
              }),
            },
            {
              path: 'courses',
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'CoursesIndex' */
                    'bundles/system/admin/admin/pages/CoursesIndex'
                  )
                ).default,
              }),
            },
          ],
        },
        {
          path: 'admin/instance',
          lazy: async () => {
            const InstanceAdminNavigator = (
              await import(
                /* webpackChunkName: 'InstanceAdminNavigator' */
                'bundles/system/admin/instance/instance/InstanceAdminNavigator'
              )
            ).default;

            return {
              Component: InstanceAdminNavigator,
              handle: InstanceAdminNavigator.handle,
            };
          },
          children: [
            {
              index: true,
              element: <Navigate to="announcements" />,
            },
            {
              path: 'announcements',
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'InstanceAnnouncementsIndex' */
                    'bundles/system/admin/instance/instance/pages/InstanceAnnouncementsIndex'
                  )
                ).default,
              }),
            },
            {
              path: 'components',
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'InstanceComponentsIndex' */
                    'bundles/system/admin/instance/instance/pages/InstanceComponentsIndex'
                  )
                ).default,
              }),
            },
            {
              path: 'courses',
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'InstanceCoursesIndex' */
                    'bundles/system/admin/instance/instance/pages/InstanceCoursesIndex'
                  )
                ).default,
              }),
            },
            {
              path: 'users',
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'InstanceUsersIndex' */
                    'bundles/system/admin/instance/instance/pages/InstanceUsersIndex'
                  )
                ).default,
              }),
            },
            {
              path: 'users/invite',
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'InstanceUsersInvite' */
                    'bundles/system/admin/instance/instance/pages/InstanceUsersInvite'
                  )
                ).default,
              }),
            },
            {
              path: 'user_invitations',
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'InstanceUsersInvitations' */
                    'bundles/system/admin/instance/instance/pages/InstanceUsersInvitations'
                  )
                ).default,
              }),
            },
            {
              path: 'role_requests',
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'InstanceUserRoleRequestsIndex' */
                    'bundles/system/admin/instance/instance/pages/InstanceUserRoleRequestsIndex'
                  )
                ).default,
              }),
            },
          ],
        },
        {
          path: 'announcements',
          lazy: async () => {
            const GlobalAnnouncementIndex = (
              await import(
                /* webpackChunkName: 'GlobalAnnouncementIndex' */
                'bundles/announcements/GlobalAnnouncementIndex'
              )
            ).default;

            return {
              Component: GlobalAnnouncementIndex,
              handle: GlobalAnnouncementIndex.handle,
            };
          },
        },
        {
          path: 'users',
          children: [
            {
              path: ':userId',
              lazy: async () => ({
                Component: (
                  await import(
                    /* webpackChunkName: 'UserShow' */
                    'bundles/users/pages/UserShow'
                  )
                ).default,
              }),
            },
            {
              path: 'confirmation',
              children: [
                {
                  index: true,
                  lazy: async () => {
                    const ConfirmEmailPage = (
                      await import(
                        /* webpackChunkName: 'ConfirmEmailPage' */
                        'bundles/users/pages/ConfirmEmailPage'
                      )
                    ).default;

                    return {
                      element: <Navigate to="/" />,
                      errorElement: <ConfirmEmailPage.InvalidRedirect />,
                      loader: ConfirmEmailPage.loader,
                    };
                  },
                },
              ],
            },
          ],
        },
        {
          path: 'user/profile/edit',
          lazy: async () => {
            const AccountSettings = (
              await import(
                /* webpackChunkName: 'AccountSettings' */
                'bundles/user/AccountSettings'
              )
            ).default;

            return {
              Component: AccountSettings,
              handle: AccountSettings.handle,
            };
          },
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

// Memoized App is needed here due to auth token renewal.
// When an access token is being renewed, react-oidc-context triggers re-render.
// We dont want the page to be refreshed since the desired behavior is that
// the access token in the local storage is updated
const MemoizedAuthenticatedApp = memo(AuthenticatedApp);

export default withAuthenticationRequired(MemoizedAuthenticatedApp, {
  signinRedirectArgs: { redirect_uri: window.location.href },
});
