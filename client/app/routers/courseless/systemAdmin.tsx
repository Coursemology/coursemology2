import { Navigate, RouteObject } from 'react-router-dom';

import { Translated } from 'lib/hooks/useTranslation';

const systemAdminRouter: Translated<RouteObject> = (_) => ({
  path: 'admin',
  lazy: async (): Promise<RouteObject> => {
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
      lazy: async (): Promise<RouteObject> => ({
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
      lazy: async (): Promise<RouteObject> => ({
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
      lazy: async (): Promise<RouteObject> => ({
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
      lazy: async (): Promise<RouteObject> => ({
        Component: (
          await import(
            /* webpackChunkName: 'CoursesIndex' */
            'bundles/system/admin/admin/pages/CoursesIndex'
          )
        ).default,
      }),
    },
  ],
});

export default systemAdminRouter;
