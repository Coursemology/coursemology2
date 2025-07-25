import { RouteObject } from 'react-router-dom';

import { Translated } from 'lib/hooks/useTranslation';

const scholaisticRouter: Translated<RouteObject> = (t) => ({
  path: 'scholaistic',
  children: [
    {
      path: 'assessments',
      children: [
        {
          index: true,
          lazy: async (): Promise<RouteObject> => ({
            Component: (
              await import(
                /* webpackChunkName: 'ScholaisticAssessmentsIndex' */
                'course/scholaistic/pages/ScholaisticAssessmentsIndex'
              )
            ).default,
            loader: (
              await import(
                /* webpackChunkName: 'scholaisticAssessmentsIndexLoader' */
                'course/scholaistic/pages/ScholaisticAssessmentsIndex/loader'
              )
            ).loader,
            handle: (
              await import(
                /* webpackChunkName: 'scholaisticAssessmentsHandle' */
                'course/scholaistic/handles'
              )
            ).scholaisticAssessmentsHandle,
          }),
        },
      ],
    },
  ],
});

export default scholaisticRouter;
