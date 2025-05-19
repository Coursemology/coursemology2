import { RouteObject } from 'react-router-dom';

import { Translated } from 'lib/hooks/useTranslation';

const submissionsRouter: Translated<RouteObject> = (_) => ({
  path: 'submissions',
  children: [
    {
      index: true,
      lazy: async (): Promise<RouteObject> => {
        const AssessmentSubmissionsIndex = (
          await import(
            /* webpackChunkName: 'AssessmentSubmissionsIndex' */
            'course/assessment/submission/pages/SubmissionsIndex'
          )
        ).default;

        return {
          Component: AssessmentSubmissionsIndex,
          handle: AssessmentSubmissionsIndex.handle,
        };
      },
    },
    {
      path: ':submissionId',
      children: [
        {
          path: 'edit',
          lazy: async (): Promise<RouteObject> => {
            const SubmissionEditIndex = (
              await import(
                /* webpackChunkName: 'SubmissionEditIndex' */
                'course/assessment/submission/pages/SubmissionEditIndex'
              )
            ).default;

            return {
              Component: SubmissionEditIndex,
              handle: SubmissionEditIndex.handle,
            };
          },
        },
        {
          path: 'logs',
          lazy: async (): Promise<RouteObject> => {
            const SubmissionLogs = (
              await import(
                /* webpackChunkName: 'SubmissionLogs' */
                'course/assessment/submission/pages/LogsIndex'
              )
            ).default;

            return {
              Component: SubmissionLogs,
              handle: SubmissionLogs.handle,
            };
          },
        },
      ],
    },
  ],
});
export default submissionsRouter;
