import { RouteObject } from 'react-router-dom';

import { Translated } from 'lib/hooks/useTranslation';

const groupsRouter: Translated<RouteObject> = (_) => ({
  path: 'groups',
  lazy: async (): Promise<RouteObject> => {
    const GroupIndex = (
      await import(
        /* webpackChunkName: 'GroupIndex' */
        'course/group/pages/GroupIndex'
      )
    ).default;

    return {
      Component: GroupIndex,
      handle: GroupIndex.handle,
    };
  },
  children: [
    {
      path: ':groupCategoryId',
      lazy: async (): Promise<RouteObject> => ({
        Component: (
          await import(
            /* webpackChunkName: 'GroupShow' */
            'course/group/pages/GroupShow'
          )
        ).default,
      }),
    },
  ],
});

export default groupsRouter;
