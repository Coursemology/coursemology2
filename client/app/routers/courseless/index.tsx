import { Navigate, RouteObject } from 'react-router-dom';
import { WithRequired } from 'types';

import { Translated } from 'lib/hooks/useTranslation';

import { reservedRoutes } from '../redirects';

import instanceAdminRouter from './instanceAdmin';
import systemAdminRouter from './systemAdmin';
import usersRouter from './users';

const courselessRouter: Translated<RouteObject> = (t) => ({
  path: '*',
  lazy: async (): Promise<WithRequired<RouteObject, 'element'>> => {
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
    instanceAdminRouter(t),
    systemAdminRouter(t),
    usersRouter(t),
    {
      path: 'announcements',
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => {
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
      path: 'user/profile/edit',
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => {
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
});

export default courselessRouter;
