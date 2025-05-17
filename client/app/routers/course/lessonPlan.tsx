import { RouteObject } from 'react-router-dom';

import { Translated } from 'lib/hooks/useTranslation';

const lessonPlanRouter: Translated<RouteObject> = (_) => ({
  path: 'lesson_plan',
  lazy: async (): Promise<RouteObject> => {
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
      lazy: async (): Promise<RouteObject> => ({
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
      lazy: async (): Promise<RouteObject> => ({
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
