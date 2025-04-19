/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { protectedRoutes } from './redirects';
import createAppRouter from './router';

const unauthenticatedRouter = createAppRouter([
  protectedRoutes,
  {
    path: '*',
    lazy: async () => {
      const CourselessContainer = (
        await import(
          /* webpackChunkName: "CourselessContainer" */
          'lib/containers/CourselessContainer'
        )
      ).default;

      return {
        element: <CourselessContainer withGotoCoursesLink />,
      };
    },
    children: [
      {
        index: true,
        lazy: async () => ({
          Component: (
            await import(
              /* webpackChunkName: "LandingPage" */
              'bundles/common/LandingPage'
            )
          ).default,
        }),
      },
      {
        index: true,
        path: 'auth',
        lazy: async () => ({
          Component: (
            await import(
              /* webpackChunkName: "AuthenticationRedirection" */
              'bundles/authentication/pages/AuthenticationRedirection'
            )
          ).default,
        }),
      },
      {
        path: 'users',
        lazy: async () => ({
          Component: (
            await import(
              /* webpackChunkName: "AuthPagesContainer" */
              'lib/containers/AuthPagesContainer'
            )
          ).default,
        }),
        children: [
          {
            index: true,
            path: 'sign_in',
            lazy: async () => ({
              Component: (
                await import(
                  /* webpackChunkName: "AuthenticationRedirection" */
                  'bundles/authentication/pages/AuthenticationRedirection'
                )
              ).default,
            }),
          },
          {
            path: 'sign_up',
            children: [
              {
                index: true,
                lazy: async () => {
                  const SignUpPage = (
                    await import(
                      /* webpackChunkName: "SignUpPage" */
                      'bundles/users/pages/SignUpPage'
                    )
                  ).default;

                  return {
                    Component: SignUpPage,
                    loader: SignUpPage.loader,
                  };
                },
              },
              {
                path: 'completed',
                lazy: async () => ({
                  Component: (
                    await import(
                      /* webpackChunkName: "SignUpLandingPage" */
                      'bundles/users/pages/SignUpLandingPage'
                    )
                  ).default,
                }),
              },
            ],
          },
          {
            path: 'confirmation',
            children: [
              {
                index: true,
                lazy: async () => {
                  const ConfirmEmailPage = (
                    await import(
                      /* webpackChunkName: "ConfirmEmailPage" */
                      'bundles/users/pages/ConfirmEmailPage'
                    )
                  ).default;

                  return {
                    Component: ConfirmEmailPage,
                    loader: ConfirmEmailPage.loader,
                    errorElement: <ConfirmEmailPage.InvalidRedirect />,
                  };
                },
              },
              {
                path: 'new',
                children: [
                  {
                    index: true,
                    lazy: async () => ({
                      Component: (
                        await import(
                          /* webpackChunkName: "ResendConfirmationEmailPage" */
                          'bundles/users/pages/ResendConfirmationEmailPage'
                        )
                      ).default,
                    }),
                  },
                  {
                    path: 'completed',
                    lazy: async () => ({
                      Component: (
                        await import(
                          /* webpackChunkName: "ResendConfirmationEmailLandingPage" */
                          'bundles/users/pages/ResendConfirmationEmailLandingPage'
                        )
                      ).default,
                    }),
                  },
                ],
              },
            ],
          },
          {
            path: 'password',
            children: [
              {
                path: 'new',
                children: [
                  {
                    index: true,
                    lazy: async () => ({
                      Component: (
                        await import(
                          /* webpackChunkName: "ForgotPasswordPage" */
                          'bundles/users/pages/ForgotPasswordPage'
                        )
                      ).default,
                    }),
                  },
                  {
                    path: 'completed',
                    lazy: async () => ({
                      Component: (
                        await import(
                          /* webpackChunkName: "ForgotPasswordLandingPage" */
                          'bundles/users/pages/ForgotPasswordLandingPage'
                        )
                      ).default,
                    }),
                  },
                ],
              },
              {
                path: 'edit',
                lazy: async () => {
                  const ResetPasswordPage = (
                    await import(
                      /* webpackChunkName: "ResetPasswordPage" */
                      'bundles/users/pages/ResetPasswordPage'
                    )
                  ).default;

                  return {
                    Component: ResetPasswordPage,
                    loader: ResetPasswordPage.loader,
                    errorElement: <ResetPasswordPage.InvalidRedirect />,
                  };
                },
              },
            ],
          },
        ],
      },
    ],
  },
]);

const UnauthenticatedApp = (): JSX.Element => (
  <RouterProvider router={createBrowserRouter(unauthenticatedRouter)} />
);

export default UnauthenticatedApp;
