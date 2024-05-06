import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import AuthenticationRedirection from 'bundles/authentication/pages/AuthenticationRedirection';
import LandingPage from 'bundles/common/LandingPage';
import ConfirmEmailPage from 'bundles/users/pages/ConfirmEmailPage';
import ForgotPasswordLandingPage from 'bundles/users/pages/ForgotPasswordLandingPage';
import ForgotPasswordPage from 'bundles/users/pages/ForgotPasswordPage';
import ResendConfirmationEmailLandingPage from 'bundles/users/pages/ResendConfirmationEmailLandingPage';
import ResendConfirmationEmailPage from 'bundles/users/pages/ResendConfirmationEmailPage';
import ResetPasswordPage from 'bundles/users/pages/ResetPasswordPage';
import SignUpLandingPage from 'bundles/users/pages/SignUpLandingPage';
import SignUpPage from 'bundles/users/pages/SignUpPage';
import AuthPagesContainer from 'lib/containers/AuthPagesContainer';
import CourselessContainer from 'lib/containers/CourselessContainer';

import { protectedRoutes } from './redirects';
import createAppRouter from './router';

const unauthenticatedRouter = createAppRouter([
  protectedRoutes,
  {
    path: '*',
    element: <CourselessContainer withGotoCoursesLink />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        index: true,
        path: 'auth',
        element: <AuthenticationRedirection />,
      },
      {
        path: 'users',
        element: <AuthPagesContainer />,
        children: [
          {
            index: true,
            path: 'sign_in',
            element: <AuthenticationRedirection />,
          },
          {
            path: 'sign_up',
            children: [
              {
                index: true,
                loader: SignUpPage.loader,
                element: <SignUpPage />,
              },
              {
                path: 'completed',
                element: <SignUpLandingPage />,
              },
            ],
          },
          {
            path: 'confirmation',
            children: [
              {
                index: true,
                loader: ConfirmEmailPage.loader,
                element: <ConfirmEmailPage />,
                errorElement: <ConfirmEmailPage.InvalidRedirect />,
              },
              {
                path: 'new',
                children: [
                  {
                    index: true,
                    element: <ResendConfirmationEmailPage />,
                  },
                  {
                    path: 'completed',
                    element: <ResendConfirmationEmailLandingPage />,
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
                    element: <ForgotPasswordPage />,
                  },
                  {
                    path: 'completed',
                    element: <ForgotPasswordLandingPage />,
                  },
                ],
              },
              {
                path: 'edit',
                loader: ResetPasswordPage.loader,
                errorElement: <ResetPasswordPage.InvalidRedirect />,
                element: <ResetPasswordPage />,
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
