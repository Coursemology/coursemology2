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
        // Load-bearing: React Router makes a parent that has a path a matchable branch of its own, so
        // without a child here `/submissions/:id` rendered this route's empty default outlet. `edit` is
        // also the bare URL's right meaning — the Rails resource has no `show`, and every submission
        // link the app builds is an `edit_course_assessment_submission_path`.
        { index: true, element: <Navigate replace to="edit" /> },
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
