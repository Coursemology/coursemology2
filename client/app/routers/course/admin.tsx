import { RouteObject } from 'react-router-dom';

import { Translated } from 'lib/hooks/useTranslation';

const adminRouter: Translated<RouteObject> = (_) => ({
  path: 'admin',
  lazy: async (): Promise<RouteObject> => {
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
      lazy: async (): Promise<RouteObject> => ({
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
      lazy: async (): Promise<RouteObject> => ({
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
      lazy: async (): Promise<RouteObject> => ({
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
      lazy: async (): Promise<RouteObject> => ({
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
      lazy: async (): Promise<RouteObject> => ({
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
      lazy: async (): Promise<RouteObject> => ({
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
      lazy: async (): Promise<RouteObject> => ({
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
      lazy: async (): Promise<RouteObject> => ({
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
      lazy: async (): Promise<RouteObject> => ({
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
      lazy: async (): Promise<RouteObject> => ({
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
      lazy: async (): Promise<RouteObject> => ({
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
      lazy: async (): Promise<RouteObject> => ({
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
      lazy: async (): Promise<RouteObject> => ({
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
      lazy: async (): Promise<RouteObject> => ({
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
      lazy: async (): Promise<RouteObject> => ({
        Component: (
          await import(
            /* webpackChunkName: 'RagWiseSettings' */
            'course/admin/pages/RagWiseSettings'
          )
        ).default,
      }),
    },
  ],
});

export default adminRouter;
