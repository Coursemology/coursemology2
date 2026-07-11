import { RouteObject } from 'react-router-dom';
import { WithRequired } from 'types';

import { Translated } from 'lib/hooks/useTranslation';

const marketplaceRouter: Translated<RouteObject> = (t) => ({
  path: 'marketplace',
  lazy: async () => ({
    handle: (await import('course/marketplace/handles')).marketplaceHandle,
  }),
  children: [
    {
      index: true,
      lazy: async () => ({
        Component: (await import('course/marketplace/pages/MarketplaceIndex'))
          .default,
      }),
    },
    {
      path: 'listings/:listingId',
      lazy: async () => ({
        handle: (await import('course/marketplace/handles')).listingHandle,
      }),
      children: [
        {
          index: true,
          lazy: async () => ({
            Component: (await import('course/marketplace/pages/ListingPreview'))
              .default,
          }),
        },
        {
          path: 'attempt',
          lazy: async (): Promise<WithRequired<RouteObject, 'loader'>> => {
            const listingAttemptLoader = (
              await import(
                /* webpackChunkName: 'listingAttemptLoader' */
                'course/marketplace/attemptLoader'
              )
            ).default;

            return { loader: listingAttemptLoader(t) };
          },
        },
        {
          path: 'questions/:questionId',
          lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => {
            const [{ default: Component }, { questionHandle }] =
              await Promise.all([
                import('course/marketplace/pages/QuestionPreview'),
                import('course/marketplace/handles'),
              ]);
            return { Component, handle: questionHandle };
          },
        },
      ],
    },
  ],
});

export default marketplaceRouter;
