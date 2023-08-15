import { RouteObject } from 'react-router-dom';
import { resetStore } from 'store';

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
      if (isChangingCourse) {
        // React Router's documentation never strictly mentioned that `shouldRevalidate`
        // should be a pure function, but a good software engineer would probably expect
        // it to be. Until we multi-course support in our Redux store, this is where
        // we can detect the `courseId` is changing without janky `useEffect`. It should
        // be safe since `resetStore` does not interfere with rendering or routing.
        resetStore();
        return true;
      }

      const currentNest = props.currentUrl.pathname.split('/')[1];
      const nextNest = props.nextUrl.pathname.split('/')[1];
      return currentNest !== nextNest;
    },
    children: [
      ...router,
      {
        path: '*',
        element: <CourselessContainer withCourseSwitcher withUserMenu />,
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
