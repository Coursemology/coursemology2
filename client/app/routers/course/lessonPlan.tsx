import { RouteObject } from 'react-router-dom';
import { WithRequired } from 'types';

import { Translated } from 'lib/hooks/useTranslation';

const lessonPlanRouter: Translated<RouteObject> = (_) => ({
  path: 'lesson_plan',
  lazy: async (): Promise<WithRequired<RouteObject, 'handle'>> => {
    const LessonPlanLayout = (
      await import(
        /* webpackChunkName: 'LessonPlanLayout' */
        'course/lesson-plan/containers/LessonPlanLayout'
      )
    ).default;

    return {
      // @ts-ignore `connect` throws error when cannot find `store` as direct parent
      element: <LessonPlanLayout />,
      handle: LessonPlanLayout.handle,
    };
  },
  children: [
    {
      index: true,
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => ({
        Component: (
          await import(
            /* webpackChunkName: 'LessonPlanShow' */
            'course/lesson-plan/pages/LessonPlanShow'
          )
        ).default,
      }),
    },
    {
      path: 'edit',
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => ({
        Component: (
          await import(
            /* webpackChunkName: 'LessonPlanEdit' */
            'course/lesson-plan/pages/LessonPlanEdit'
          )
        ).default,
      }),
    },
  ],
});

export default lessonPlanRouter;
