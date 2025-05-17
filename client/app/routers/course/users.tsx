import { RouteObject } from 'react-router-dom';

import { Translated } from 'lib/hooks/useTranslation';

const usersRouter: Translated<RouteObject> = (_) => ({
  path: 'users',
  children: [
    {
      index: true,
      lazy: async (): Promise<RouteObject> => {
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
      lazy: async (): Promise<RouteObject> => {
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
      lazy: async (): Promise<RouteObject> => {
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
      lazy: async (): Promise<RouteObject> => ({
        handle: await import(
          /* webpackChunkName: 'userHandles' */
          'course/users/handles'
        ).then((module) => module.courseUserHandle),
      }),
      children: [
        {
          index: true,
          lazy: async (): Promise<RouteObject> => ({
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
          lazy: async (): Promise<RouteObject> => {
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
      lazy: async (): Promise<RouteObject> => {
        const [courseUserPersonalizedTimelineHandle, InviteUsers] =
          await Promise.all([
            import(
              /* webpackChunkName: 'userHandles' */
              'course/users/handles'
            ).then((module) => module.courseUserPersonalizedTimelineHandle),
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
      lazy: async (): Promise<RouteObject> => {
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
      lazy: async (): Promise<RouteObject> => {
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
});

export default usersRouter;
