import { RouteObject } from 'react-router-dom';
import { WithRequired } from 'types';

import { Translated } from 'lib/hooks/useTranslation';

const achievementsRouter: Translated<RouteObject> = (_) => ({
  path: 'achievements',
  lazy: async (): Promise<WithRequired<RouteObject, 'handle'>> => ({
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
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => ({
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
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => {
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
