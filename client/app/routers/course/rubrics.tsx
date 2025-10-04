import { RouteObject } from 'react-router-dom';

import { Translated } from 'lib/hooks/useTranslation';

const rubricsRouter: Translated<RouteObject> = (_) => ({
  path: 'rubrics/playground',
  lazy: async (): Promise<RouteObject> => {
    const RubricPlayground = (
      await import(
        /* webpackChunkName: 'RubricPlayground' */
        'course/assessment/question/rubric-playground/RubricPlaygroundPage'
      )
    ).default;

    return {
      Component: RubricPlayground,
      handle: RubricPlayground.handle,
    };
  },
});

export default rubricsRouter;
