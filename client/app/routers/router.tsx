/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { RouteObject } from 'react-router-dom';
import { resetStore } from 'store';

const createAppRouter = (router: RouteObject[]): RouteObject[] => [
  {
    path: '/',
    lazy: async () => {
      const AppContainer = (
        await import(
          /* webpackChunkName: "AppContainer" */
          'lib/containers/AppContainer'
        )
      ).default;

      return {
        Component: AppContainer,
        loader: AppContainer.loader,
        errorElement: <AppContainer.ErrorBoundary />,
      };
    },
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
        lazy: async () => {
          const CourselessContainer = (
            await import(
              /* webpackChunkName: "CourselessContainer" */
              'lib/containers/CourselessContainer'
            )
          ).default;

          return {
            element: <CourselessContainer withCourseSwitcher withUserMenu />,
          };
        },
        children: [
          {
            path: 'courses',
            lazy: async () => {
              const CoursesIndex = (
                await import(
                  /* webpackChunkName: "CoursesIndex" */
                  'bundles/course/courses/pages/CoursesIndex'
                )
              ).default;

              return {
                Component: CoursesIndex,
                handle: CoursesIndex.handle,
              };
            },
          },
          {
            path: 'pages',
            children: [
              {
                path: 'terms_of_service',
                lazy: async () => {
                  const TermsOfServicePage = (
                    await import(
                      /* webpackChunkName: "TermsOfServicePage" */
                      'bundles/common/TermsOfServicePage'
                    )
                  ).default;

                  return {
                    Component: TermsOfServicePage,
                    handle: TermsOfServicePage.handle,
                  };
                },
              },
              {
                path: 'privacy_policy',
                lazy: async () => {
                  const PrivacyPolicyPage = (
                    await import(
                      /* webpackChunkName: "PrivacyPolicyPage" */
                      'bundles/common/PrivacyPolicyPage'
                    )
                  ).default;

                  return {
                    Component: PrivacyPolicyPage,
                    handle: PrivacyPolicyPage.handle,
                  };
                },
              },
            ],
          },
          {
            path: 'forbidden',
            lazy: async () => {
              const ErrorPage = (
                await import(
                  /* webpackChunkName: "ErrorPage" */
                  'bundles/common/ErrorPage'
                )
              ).default;

              return {
                Component: ErrorPage.Forbidden,
                loader: ErrorPage.Forbidden.loader,
              };
            },
          },
          {
            path: '*',
            lazy: async () => {
              const ErrorPage = (
                await import(
                  /* webpackChunkName: "ErrorPage" */
                  'bundles/common/ErrorPage'
                )
              ).default;

              return {
                Component: ErrorPage.NotFound,
              };
            },
          },
        ],
      },
    ],
  },
];

export default createAppRouter;
