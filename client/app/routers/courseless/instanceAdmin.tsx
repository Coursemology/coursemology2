import { Navigate, RouteObject } from 'react-router-dom';
import { WithRequired } from 'types';

import { Translated } from 'lib/hooks/useTranslation';

const instanceAdminRouter: Translated<RouteObject> = (_) => ({
  path: 'admin/instance',
  lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => {
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
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => ({
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
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => ({
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
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => ({
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
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => ({
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
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => ({
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
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => ({
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
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => ({
        Component: (
          await import(
            /* webpackChunkName: 'InstanceUserRoleRequestsIndex' */
            'bundles/system/admin/instance/instance/pages/InstanceUserRoleRequestsIndex'
          )
        ).default,
      }),
    },
    {
      path: 'get_help',
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => ({
        Component: (
          await import(
            /* webpackChunkName: 'InstanceGetHelpActivityIndex' */
            'bundles/system/admin/instance/instance/pages/InstanceGetHelpActivityIndex'
          )
        ).default,
      }),
    },
  ],
});

export default instanceAdminRouter;
