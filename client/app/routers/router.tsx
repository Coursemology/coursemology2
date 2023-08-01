import { RouteObject } from 'react-router-dom';

import ErrorPage from 'bundles/common/ErrorPage';
import PrivacyPolicyPage from 'bundles/common/PrivacyPolicyPage';
import TermsOfServicePage from 'bundles/common/TermsOfServicePage';
import CoursesIndex from 'bundles/course/courses/pages/CoursesIndex';
import AppContainer from 'lib/containers/AppContainer';
import CourselessContainer from 'lib/containers/CourselessContainer';

const createAppRouter = (router: RouteObject[]): RouteObject[] => [
  {
    path: '/',
    element: <AppContainer />,
    loader: AppContainer.loader,
    errorElement: <AppContainer.ErrorBoundary />,
    shouldRevalidate: (props): boolean => {
      const isChangingCourse =
        props.currentParams.courseId !== props.nextParams.courseId;
      if (isChangingCourse) return true;

      const currentNest = props.currentUrl.pathname.split('/')[1];
      const nextNest = props.nextUrl.pathname.split('/')[1];
      return currentNest !== nextNest;
    },
    children: [
      ...router,
      {
        path: '*',
        element: <CourselessContainer />,
        children: [
          {
            path: 'courses',
            handle: CoursesIndex.handle,
            element: <CoursesIndex />,
          },
          {
            path: 'pages',
            children: [
              {
                path: 'terms_of_service',
                handle: TermsOfServicePage.handle,
                element: <TermsOfServicePage />,
              },
              {
                path: 'privacy_policy',
                handle: PrivacyPolicyPage.handle,
                element: <PrivacyPolicyPage />,
              },
            ],
          },
          {
            path: 'forbidden',
            loader: ErrorPage.Forbidden.loader,
            element: <ErrorPage.Forbidden />,
          },
          {
            path: '*',
            element: <ErrorPage.NotFound />,
          },
        ],
      },
    ],
  },
];

export default createAppRouter;
