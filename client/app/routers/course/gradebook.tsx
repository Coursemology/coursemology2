import { RouteObject } from 'react-router-dom';

import { Translated } from 'lib/hooks/useTranslation';
import { WithRequired } from 'types';

const gradebookRouter: Translated<RouteObject> = (_t) => ({
  path: 'gradebook',
  lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => {
    const [{ gradebookHandle }, GradebookIndex] = await Promise.all([
      import(
        /* webpackChunkName: 'gradebookHandle' */
        'course/gradebook/handles'
      ),
      import(
        /* webpackChunkName: 'GradebookIndex' */
        'course/gradebook/pages/GradebookIndex'
      ).then((m) => m.default),
    ]);
    return { Component: GradebookIndex, handle: gradebookHandle };
  },
});

export default gradebookRouter;
