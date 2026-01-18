import { RouteObject } from 'react-router-dom';
import { WithRequired } from 'types';

import { Translated } from 'lib/hooks/useTranslation';

const surveysRouter: Translated<RouteObject> = (_) => ({
  path: 'surveys',
  lazy: async (): Promise<WithRequired<RouteObject, 'handle'>> => ({
    handle: (
      await import(
        /* webpackChunkName: 'SurveyIndex' */
        'course/survey/pages/SurveyIndex'
      )
    ).default.handle,
  }),
  children: [
    {
      index: true,
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => ({
        Component: (
          await import(
            /* webpackChunkName: 'SurveyIndex' */
            'course/survey/pages/SurveyIndex'
          )
        ).default,
      }),
    },
    {
      path: ':surveyId',
      lazy: async (): Promise<WithRequired<RouteObject, 'handle'>> => ({
        handle: (
          await import(
            /* webpackChunkName: 'surveyHandles' */
            'course/survey/handles'
          )
        ).surveyHandle,
      }),
      children: [
        {
          index: true,
          lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => ({
            Component: (
              await import(
                /* webpackChunkName: 'SurveyShow' */
                'course/survey/pages/SurveyShow'
              )
            ).default,
          }),
        },
        {
          path: 'results',
          lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => {
            const SurveyResults = (
              await import(
                /* webpackChunkName: 'SurveyResults' */
                'course/survey/pages/SurveyResults'
              )
            ).default;

            return {
              Component: SurveyResults,
              handle: SurveyResults.handle,
            };
          },
        },
        {
          path: 'responses',
          children: [
            {
              index: true,
              lazy: async (): Promise<
                WithRequired<RouteObject, 'Component'>
              > => {
                const ResponseIndex = (
                  await import(
                    /* webpackChunkName: 'ResponseIndex' */
                    'course/survey/pages/ResponseIndex'
                  )
                ).default;

                return {
                  Component: ResponseIndex,
                  handle: ResponseIndex.handle,
                };
              },
            },
            {
              path: ':responseId',
              children: [
                {
                  index: true,
                  lazy: async (): Promise<
                    WithRequired<RouteObject, 'Component'>
                  > => {
                    const [surveyResponseHandle, ResponseShow] =
                      await Promise.all([
                        import(
                          /* webpackChunkName: 'surveyHandles' */
                          'course/survey/handles'
                        ).then((module) => module.surveyResponseHandle),
                        import(
                          /* webpackChunkName: 'ResponseShow' */
                          'course/survey/pages/ResponseShow'
                        ).then((module) => module.default),
                      ]);

                    return {
                      Component: ResponseShow,
                      handle: surveyResponseHandle,
                    };
                  },
                },
                {
                  path: 'edit',
                  lazy: async (): Promise<
                    WithRequired<RouteObject, 'Component'>
                  > => ({
                    Component: (
                      await import(
                        /* webpackChunkName: 'ResponseEdit' */
                        'course/survey/pages/ResponseEdit'
                      )
                    ).default,
                  }),
                },
              ],
            },
          ],
        },
      ],
    },
  ],
});

export default surveysRouter;
