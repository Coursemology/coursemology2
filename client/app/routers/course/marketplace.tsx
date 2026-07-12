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
          lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => {
            const [
              { default: Component, previewAttemptLoader },
              { attemptHandle },
            ] = await Promise.all([
              import(
                /* webpackChunkName: 'MarketplacePreviewAttempt' */
                'course/marketplace/pages/PreviewAttempt'
              ),
              import('course/marketplace/handles'),
            ]);

            return {
              Component,
              loader: previewAttemptLoader(t),
              handle: attemptHandle,
            };
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
