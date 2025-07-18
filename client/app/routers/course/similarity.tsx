import { RouteObject } from 'react-router-dom';

import { Translated } from 'lib/hooks/useTranslation';

const similarityRouter: Translated<RouteObject> = (_) => ({
  path: 'similarity',
  lazy: async (): Promise<RouteObject> => {
    const SimilarityIndex = (
      await import(
        /* webpackChunkName: 'SimilarityIndex' */
        'course/similarity/pages/SimilarityIndex'
      )
    ).default;

    return {
      Component: SimilarityIndex,
      handle: SimilarityIndex.handle,
    };
  },
  children: [
    {
      path: 'assessments',
      lazy: async (): Promise<RouteObject> => ({
        Component: (
          await import(
            /* webpackChunkName: 'SimilarityIndex' */
            'course/similarity/pages/SimilarityIndex'
          )
        ).default,
      }),
    },
  ],
});

export default similarityRouter;
