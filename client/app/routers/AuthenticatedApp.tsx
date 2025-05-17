/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { memo } from 'react';
import { withAuthenticationRequired } from 'react-oidc-context';
import {
  createBrowserRouter,
  RouteObject,
  RouterProvider,
} from 'react-router-dom';

import useTranslation, { Translated } from 'lib/hooks/useTranslation';

import courseRouter from './course';
import courselessRouter from './courseless';
import createAppRouter from './router';

const authenticatedRouter: Translated<RouteObject[]> = (t) =>
  createAppRouter([
    courseRouter(t),
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
    courselessRouter(t),
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
