import { RouteObject } from 'react-router-dom';

import { Translated } from 'lib/hooks/useTranslation';

import questionsRouter from './questions';
import submissionsRouter from './submissions';

const assessmentsRouter: Translated<RouteObject> = (t) => ({
  path: 'assessments',
  lazy: async (): Promise<RouteObject> => ({
    handle: (
      await import(
        /* webpackChunkName: 'assessmentHandles' */
        'course/assessment/handles'
      )
    ).assessmentsHandle,
  }),
  children: [
    {
      index: true,
      lazy: async (): Promise<RouteObject> => ({
        Component: (
          await import(
            /* webpackChunkName: 'AssessmentsIndex' */
            'bundles/course/assessment/pages/AssessmentsIndex'
          )
        ).default,
      }),
    },
    {
      path: 'submissions',
      lazy: async (): Promise<RouteObject> => {
        const SubmissionsIndex = (
          await import(
            /* webpackChunkName: 'SubmissionsIndex' */
            'course/assessment/submissions/SubmissionsIndex'
          )
        ).default;

        return {
          Component: SubmissionsIndex,
          handle: SubmissionsIndex.handle,
        };
      },
    },
    {
      path: 'skills',
      lazy: async (): Promise<RouteObject> => {
        const SkillsIndex = (
          await import(
            /* webpackChunkName: 'SkillsIndex' */
            'course/assessment/skills/pages/SkillsIndex'
          )
        ).default;

        return {
          Component: SkillsIndex,
          handle: SkillsIndex.handle,
        };
      },
    },
    {
      path: ':assessmentId',
      lazy: async (): Promise<RouteObject> => ({
        handle: (
          await import(
            /* webpackChunkName: 'assessmentHandles' */
            'course/assessment/handles'
          )
        ).assessmentHandle,
      }),
      children: [
        {
          index: true,
          lazy: async (): Promise<RouteObject> => ({
            Component: (
              await import(
                /* webpackChunkName: 'AssessmentShow' */
                'course/assessment/pages/AssessmentShow'
              )
            ).default,
          }),
        },
        {
          path: 'edit',
          lazy: async (): Promise<RouteObject> => {
            const AssessmentEdit = (
              await import(
                /* webpackChunkName: 'AssessmentEdit' */
                'course/assessment/pages/AssessmentEdit'
              )
            ).default;

            return {
              Component: AssessmentEdit,
              handle: AssessmentEdit.handle,
            };
          },
        },
        {
          path: 'attempt',
          lazy: async (): Promise<RouteObject> => {
            const assessmentAttemptLoader = (
              await import(
                /* webpackChunkName: 'assessmentAttemptLoader' */
                'course/assessment/attemptLoader'
              )
            ).default;

            return { loader: assessmentAttemptLoader(t) };
          },
        },
        {
          path: 'monitoring',
          lazy: async (): Promise<RouteObject> => {
            const AssessmentMonitoring = (
              await import(
                /* webpackChunkName: 'AssessmentMonitoring' */
                'course/assessment/pages/AssessmentMonitoring'
              )
            ).default;

            return {
              Component: AssessmentMonitoring,
              handle: AssessmentMonitoring.handle,
            };
          },
        },
        {
          path: 'sessions/new',
          lazy: async (): Promise<RouteObject> => ({
            Component: (
              await import(
                /* webpackChunkName: 'AssessmentSessionNew' */
                'course/assessment/sessions/pages/AssessmentSessionNew'
              )
            ).default,
          }),
        },
        {
          path: 'statistics',
          lazy: async (): Promise<RouteObject> => {
            const AssessmentStatistics = (
              await import(
                /* webpackChunkName: 'AssessmentStatistics' */
                'course/assessment/pages/AssessmentStatistics'
              )
            ).default;

            return {
              Component: AssessmentStatistics,
              handle: AssessmentStatistics.handle,
            };
          },
        },
        {
          path: 'similarity',
          lazy: async (): Promise<RouteObject> => {
            const AssessmentSimilarity = (
              await import(
                /* webpackChunkName: 'AssessmentSimilarity' */
                'course/assessment/pages/AssessmentSimilarity'
              )
            ).default;

            return {
              Component: AssessmentSimilarity,
              handle: AssessmentSimilarity.handle,
            };
          },
        },
        submissionsRouter(t),
        questionsRouter(t),
      ],
    },
  ],
});

export default assessmentsRouter;
