import { Navigate, RouteObject } from 'react-router-dom';
import { WithRequired } from 'types';

import { Translated } from 'lib/hooks/useTranslation';

const marketplaceRouter: Translated<RouteObject> = () => ({
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
      // `listings` on its own (no id) is not a real page — send it back to the
      // marketplace index so it lands in the same place as `marketplace/`.
      path: 'listings',
      element: <Navigate replace to=".." />,
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
        {
          path: 'attempt',
          lazy: async (): Promise<
            WithRequired<
              RouteObject,
              'Component' | 'errorElement' | 'handle' | 'loader'
            >
          > => {
            const [
              { PreviewAttemptRoute, PreviewAttemptErrorElement },
              { previewAttemptLoader },
              { attemptHandle },
            ] = await Promise.all([
              import('course/marketplace/pages/PreviewAttempt'),
              import('course/marketplace/pages/PreviewAttempt/loader'),
              import('course/marketplace/handles'),
            ]);
            return {
              Component: PreviewAttemptRoute,
              errorElement: <PreviewAttemptErrorElement />,
              handle: attemptHandle,
              loader: previewAttemptLoader(),
            };
          },
        },
      ],
    },
  ],
});

export default marketplaceRouter;
