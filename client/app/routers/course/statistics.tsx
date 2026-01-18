import { RouteObject } from 'react-router-dom';
import { WithRequired } from 'types';

import { Translated } from 'lib/hooks/useTranslation';

const statisticsRouter: Translated<RouteObject> = (_) => ({
  path: 'statistics',
  lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => {
    const StatisticsIndex = (
      await import(
        /* webpackChunkName: 'StatisticsIndex' */
        'course/statistics/pages/StatisticsIndex'
      )
    ).default;

    return {
      Component: StatisticsIndex,
      handle: StatisticsIndex.handle,
    };
  },
  children: [
    {
      path: 'students',
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => ({
        Component: (
          await import(
            /* webpackChunkName: 'StudentsStatistics' */
            'course/statistics/pages/StatisticsIndex/students/StudentsStatistics'
          )
        ).default,
      }),
    },
    {
      path: 'staff',
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => ({
        Component: (
          await import(
            /* webpackChunkName: 'StaffStatistics' */
            'course/statistics/pages/StatisticsIndex/staff/StaffStatistics'
          )
        ).default,
      }),
    },
    {
      path: 'course',
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => ({
        Component: (
          await import(
            /* webpackChunkName: 'CourseStatistics' */
            'course/statistics/pages/StatisticsIndex/course/CourseStatistics'
          )
        ).default,
      }),
    },
    {
      path: 'assessments',
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => ({
        Component: (
          await import(
            /* webpackChunkName: 'CourseStatistics' */
            'course/statistics/pages/StatisticsIndex/assessments/AssessmentsStatistics'
          )
        ).default,
      }),
    },
    {
      path: 'get_help',
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => ({
        Component: (
          await import(
            /* webpackChunkName: 'CourseGetHelpStatistics' */
            'course/statistics/pages/StatisticsIndex/get_help/CourseGetHelpStatistics'
          )
        ).default,
      }),
    },
  ],
});

export default statisticsRouter;
