import { Navigate, RouteObject } from 'react-router-dom';

import { Translated } from 'lib/hooks/useTranslation';

const usersRouter: Translated<RouteObject> = (_) => ({
  path: 'users',
  children: [
    {
      path: ':userId',
      lazy: async (): Promise<RouteObject> => ({
        Component: (
          await import(
            /* webpackChunkName: 'UserShow' */
            'bundles/users/pages/UserShow'
          )
        ).default,
      }),
    },
    {
      path: 'confirmation',
      children: [
        {
          index: true,
          lazy: async (): Promise<RouteObject> => {
            const ConfirmEmailPage = (
              await import(
                /* webpackChunkName: 'ConfirmEmailPage' */
                'bundles/users/pages/ConfirmEmailPage'
              )
            ).default;

            return {
              element: <Navigate to="/" />,
              errorElement: <ConfirmEmailPage.InvalidRedirect />,
              loader: ConfirmEmailPage.loader,
            };
          },
        },
      ],
    },
  ],
});

export default usersRouter;
