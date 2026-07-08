import { RouteObject } from 'react-router-dom';

import { Translated } from 'lib/hooks/useTranslation';

const marketplaceRouter: Translated<RouteObject> = () => ({
  path: 'marketplace',
  children: [
    {
      index: true,
      lazy: async () => ({
        Component: (await import('course/marketplace/pages/MarketplaceIndex'))
          .default,
      }),
    },
  ],
});

export default marketplaceRouter;
