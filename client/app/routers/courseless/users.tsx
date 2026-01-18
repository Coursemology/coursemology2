import { Navigate, RouteObject } from 'react-router-dom';
import { WithRequired } from 'types';

import { Translated } from 'lib/hooks/useTranslation';

const usersRouter: Translated<RouteObject> = (_) => ({
  path: 'users',
  children: [
    {
      path: ':userId',
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => ({
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
          lazy: async (): Promise<WithRequired<RouteObject, 'element'>> => {
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
