import { RouteObject } from 'react-router-dom';

import { Translated } from 'lib/hooks/useTranslation';

const achievementsRouter: Translated<RouteObject> = (_) => ({
  path: 'achievements',
  lazy: async (): Promise<RouteObject> => ({
    handle: (
      await import(
        /* webpackChunkName: 'AchievementsIndex' */
        'course/achievement/pages/AchievementsIndex'
      )
    ).default.handle,
  }),
  children: [
    {
      index: true,
      lazy: async (): Promise<RouteObject> => ({
        Component: (
          await import(
            /* webpackChunkName: 'AchievementsIndex' */
            'course/achievement/pages/AchievementsIndex'
          )
        ).default,
      }),
    },
    {
      path: ':achievementId',
      lazy: async (): Promise<RouteObject> => {
        const [achievementHandle, AchievementShow] = await Promise.all([
          import(
            /* webpackChunkName: 'achievementHandle' */
            'course/achievement/handles'
          ).then((module) => module.achievementHandle),
          import(
            /* webpackChunkName: 'AchievementShow' */
            'course/achievement/pages/AchievementShow'
          ).then((module) => module.default),
        ]);

        return {
          Component: AchievementShow,
          handle: achievementHandle,
        };
      },
    },
  ],
});

export default achievementsRouter;
