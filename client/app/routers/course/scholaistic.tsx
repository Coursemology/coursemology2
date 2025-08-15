import { RouteObject } from 'react-router-dom';

import { Translated } from 'lib/hooks/useTranslation';

const scholaisticRouter: Translated<RouteObject> = (t) => ({
  path: 'scholaistic',
  lazy: async (): Promise<RouteObject> => ({
    ErrorBoundary: (
      await import('course/scholaistic/components/ScholaisticErrorPage')
    ).default,
  }),
  children: [
    {
      path: 'assessments',
      lazy: async (): Promise<RouteObject> => ({
        handle: (await import('course/scholaistic/handles')).assessmentsHandle,
      }),
      children: [
        {
          index: true,
          lazy: async (): Promise<RouteObject> => ({
            Component: (
              await import(
                'course/scholaistic/pages/ScholaisticAssessmentsIndex'
              )
            ).default,
            loader: (
              await import(
                'course/scholaistic/pages/ScholaisticAssessmentsIndex/loader'
              )
            ).loader,
          }),
        },
        {
          path: ':assessmentId',
          lazy: async (): Promise<RouteObject> => ({
            handle: (await import('course/scholaistic/handles'))
              .assessmentHandle,
          }),
          children: [
            {
              index: true,
              lazy: async (): Promise<RouteObject> => ({
                Component: (
                  await import(
                    'course/scholaistic/pages/ScholaisticAssessmentView'
                  )
                ).default,
                loader: (
                  await import(
                    'course/scholaistic/pages/ScholaisticAssessmentView/loader'
                  )
                ).loader,
              }),
            },
            {
              path: 'submission',
              lazy: async (): Promise<RouteObject> => ({
                loader: (
                  await import(
                    'course/scholaistic/pages/ScholaisticAssessmentSubmissionEdit/loader'
                  )
                ).submissionLoader,
              }),
            },
            {
              path: 'submissions',
              children: [
                {
                  index: true,
                  lazy: async (): Promise<RouteObject> => ({
                    Component: (
                      await import(
                        'course/scholaistic/pages/ScholaisticAssessmentSubmissionsIndex'
                      )
                    ).default,
                    loader: (
                      await import(
                        'course/scholaistic/pages/ScholaisticAssessmentSubmissionsIndex/loader'
                      )
                    ).loader,
                    handle: (
                      await import(
                        'course/scholaistic/pages/ScholaisticAssessmentSubmissionsIndex'
                      )
                    ).handle,
                  }),
                },
                {
                  path: ':submissionId',
                  lazy: async (): Promise<RouteObject> => ({
                    Component: (
                      await import(
                        'course/scholaistic/pages/ScholaisticAssessmentSubmissionEdit'
                      )
                    ).default,
                    loader: (
                      await import(
                        'course/scholaistic/pages/ScholaisticAssessmentSubmissionEdit/loader'
                      )
                    ).loader,
                    handle: (await import('course/scholaistic/handles'))
                      .submissionHandle,
                  }),
                },
              ],
            },
            {
              path: 'edit',
              lazy: async (): Promise<RouteObject> => ({
                Component: (
                  await import(
                    'course/scholaistic/pages/ScholaisticAssessmentEdit'
                  )
                ).default,
                loader: (
                  await import(
                    'course/scholaistic/pages/ScholaisticAssessmentEdit/loader'
                  )
                ).loader,
                handle: (
                  await import(
                    'course/scholaistic/pages/ScholaisticAssessmentEdit'
                  )
                ).handle,
              }),
            },
          ],
        },
        {
          path: 'new',
          lazy: async (): Promise<RouteObject> => ({
            Component: (
              await import('course/scholaistic/pages/ScholaisticAssessmentNew')
            ).default,
            loader: (
              await import(
                'course/scholaistic/pages/ScholaisticAssessmentNew/loader'
              )
            ).loader,
            handle: (
              await import('course/scholaistic/pages/ScholaisticAssessmentNew')
            ).handle,
          }),
        },
      ],
    },
    {
      path: 'assistants',
      lazy: async (): Promise<RouteObject> => ({
        handle: (
          await import('course/scholaistic/pages/ScholaisticAssistantsIndex')
        ).handle,
      }),
      children: [
        {
          index: true,
          lazy: async (): Promise<RouteObject> => ({
            Component: (
              await import(
                'course/scholaistic/pages/ScholaisticAssistantsIndex'
              )
            ).default,
            loader: (
              await import(
                'course/scholaistic/pages/ScholaisticAssistantsIndex/loader'
              )
            ).loader,
          }),
        },
        {
          path: ':assistantId',
          lazy: async (): Promise<RouteObject> => ({
            Component: (
              await import('course/scholaistic/pages/ScholaisticAssistantEdit')
            ).default,
            loader: (
              await import(
                'course/scholaistic/pages/ScholaisticAssistantEdit/loader'
              )
            ).loader,
            handle: (await import('course/scholaistic/handles'))
              .assistantHandle,
          }),
        },
      ],
    },
  ],
});

export default scholaisticRouter;
