import { Navigate, RouteObject } from 'react-router-dom';
import { WithRequired } from 'types';

import { Translated } from 'lib/hooks/useTranslation';

const submissionsRouter: Translated<RouteObject> = (_) => ({
  path: 'submissions',
  children: [
    {
      index: true,
      lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => {
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
          // A submission on its own has no page of its own to show, so send it to
          // the attempt page instead of rendering an empty outlet.
          index: true,
          element: <Navigate replace to="edit" />,
        },
        {
          path: 'edit',
          lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => {
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
          lazy: async (): Promise<WithRequired<RouteObject, 'Component'>> => {
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
