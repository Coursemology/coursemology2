/* eslint-disable sonarjs/no-duplicate-string */

import { RouteObject } from 'react-router-dom';

import { Translated } from 'lib/hooks/useTranslation';

const questionsRouter: Translated<RouteObject> = (_) => ({
  path: 'question',
  lazy: async (): Promise<RouteObject> => {
    const [questionHandle, QuestionFormOutlet] = await Promise.all([
      import(
        /* webpackChunkName: 'assessmentHandles' */
        'course/assessment/handles'
      ).then((module) => module.questionHandle),
      import(
        /* webpackChunkName: 'QuestionFormOutlet' */
        'course/assessment/question/components/QuestionFormOutlet'
      ).then((module) => module.default),
    ]);

    return {
      Component: QuestionFormOutlet,
      handle: questionHandle,
    };
  },
  children: [
    {
      path: 'forum_post_responses',
      children: [
        {
          path: 'new',
          lazy: async (): Promise<RouteObject> => {
            const NewForumPostResponsePage = (
              await import(
                /* webpackChunkName: 'NewForumPostResponsePage' */
                'course/assessment/question/forum-post-responses/NewForumPostResponsePage'
              )
            ).default;

            return {
              Component: NewForumPostResponsePage,
              handle: NewForumPostResponsePage.handle,
            };
          },
        },
        {
          path: ':questionId/edit',
          lazy: async (): Promise<RouteObject> => ({
            Component: (
              await import(
                /* webpackChunkName: 'EditForumPostResponsePage' */
                'course/assessment/question/forum-post-responses/EditForumPostResponsePage'
              )
            ).default,
          }),
        },
      ],
    },
    {
      path: 'text_responses',
      children: [
        {
          path: 'new',
          lazy: async (): Promise<RouteObject> => {
            const NewTextResponse = (
              await import(
                /* webpackChunkName: 'NewTextResponsePage' */
                'course/assessment/question/text-responses/NewTextResponsePage'
              )
            ).default;

            return {
              Component: NewTextResponse,
              handle: NewTextResponse.handle,
            };
          },
        },
        {
          path: ':questionId/edit',
          lazy: async (): Promise<RouteObject> => ({
            Component: (
              await import(
                /* webpackChunkName: 'EditTextResponsePage' */
                'course/assessment/question/text-responses/EditTextResponsePage'
              )
            ).default,
          }),
        },
      ],
    },
    {
      path: 'voice_responses',
      children: [
        {
          path: 'new',
          lazy: async (): Promise<RouteObject> => {
            const NewVoicePage = (
              await import(
                /* webpackChunkName: 'NewVoicePage' */
                'course/assessment/question/voice-responses/NewVoicePage'
              )
            ).default;

            return {
              Component: NewVoicePage,
              handle: NewVoicePage.handle,
            };
          },
        },
        {
          path: ':questionId/edit',
          lazy: async (): Promise<RouteObject> => ({
            Component: (
              await import(
                /* webpackChunkName: 'EditVoicePage' */
                'course/assessment/question/voice-responses/EditVoicePage'
              )
            ).default,
          }),
        },
      ],
    },
    {
      path: 'multiple_responses',
      children: [
        {
          path: 'new',
          lazy: async (): Promise<RouteObject> => {
            const NewMcqMrqPage = (
              await import(
                /* webpackChunkName: 'NewMcqMrqPage' */
                'course/assessment/question/multiple-responses/NewMcqMrqPage'
              )
            ).default;

            return {
              Component: NewMcqMrqPage,
              handle: NewMcqMrqPage.handle,
            };
          },
        },
        {
          path: 'generate',
          lazy: async (): Promise<RouteObject> => {
            const GenerateMcqMrqQuestionPage = (
              await import(
                /* webpackChunkName: 'GenerateMcqMrqQuestionPage' */
                'course/assessment/pages/AssessmentGenerate/MultipleResponse/GenerateMcqMrqQuestionPage'
              )
            ).default;

            return {
              Component: GenerateMcqMrqQuestionPage,
              handle: GenerateMcqMrqQuestionPage.handle,
            };
          },
        },
        {
          path: ':questionId/edit',
          lazy: async (): Promise<RouteObject> => ({
            Component: (
              await import(
                /* webpackChunkName: 'EditMcqMrqPage' */
                'course/assessment/question/multiple-responses/EditMcqMrqPage'
              )
            ).default,
          }),
        },
      ],
    },
    {
      path: 'scribing',
      children: [
        {
          path: 'new',
          lazy: async (): Promise<RouteObject> => {
            const ScribingQuestion = (
              await import(
                /* webpackChunkName: 'ScribingQuestion' */
                'course/assessment/question/scribing/ScribingQuestion'
              )
            ).default;

            return {
              Component: ScribingQuestion,
              handle: ScribingQuestion.handle,
            };
          },
        },
        {
          path: ':questionId/edit',
          lazy: async (): Promise<RouteObject> => ({
            Component: (
              await import(
                /* webpackChunkName: 'ScribingQuestion' */
                'course/assessment/question/scribing/ScribingQuestion'
              )
            ).default,
          }),
        },
      ],
    },
    {
      path: 'rubric_based_responses',
      children: [
        {
          path: 'new',
          lazy: async (): Promise<RouteObject> => {
            const NewRubricBasedResponsePage = (
              await import(
                /* webpackChunkName: 'NewRubricBasedResponsePage' */
                'course/assessment/question/rubric-based-responses/NewRubricBasedResponsePage'
              )
            ).default;

            return {
              Component: NewRubricBasedResponsePage,
              handle: NewRubricBasedResponsePage.handle,
            };
          },
        },
        {
          path: ':questionId/edit',
          lazy: async (): Promise<RouteObject> => ({
            Component: (
              await import(
                /* webpackChunkName: 'EditRubricBasedResponsePage' */
                'course/assessment/question/rubric-based-responses/EditRubricBasedResponsePage'
              )
            ).default,
          }),
        },
      ],
    },
    {
      path: 'programming',
      children: [
        {
          path: 'new',
          lazy: async (): Promise<RouteObject> => {
            const NewProgrammingQuestionPage = (
              await import(
                /* webpackChunkName: 'NewProgrammingQuestionPage' */
                'course/assessment/question/programming/NewProgrammingQuestionPage'
              )
            ).default;

            return {
              Component: NewProgrammingQuestionPage,
              handle: NewProgrammingQuestionPage.handle,
            };
          },
        },
        {
          path: 'generate',
          lazy: async (): Promise<RouteObject> => {
            const GenerateProgrammingQuestionPage = (
              await import(
                /* webpackChunkName: 'GenerateProgrammingQuestionPage' */
                'course/assessment/pages/AssessmentGenerate/Programming/GenerateProgrammingQuestionPage'
              )
            ).default;

            return {
              Component: GenerateProgrammingQuestionPage,
              handle: GenerateProgrammingQuestionPage.handle,
            };
          },
        },
        {
          path: ':questionId/edit',
          lazy: async (): Promise<RouteObject> => ({
            Component: (
              await import(
                /* webpackChunkName: 'EditProgrammingQuestionPage' */
                'course/assessment/question/programming/EditProgrammingQuestionPage'
              )
            ).default,
          }),
        },
      ],
    },
    {
      path: ':questionId/rubric_playground',
      lazy: async (): Promise<RouteObject> => {
        const RubricPlayground = (
          await import(
            /* webpackChunkName: 'RubricPlayground' */
            'course/assessment/question/rubric-playground/RubricPlaygroundPage'
          )
        ).default;

        return {
          Component: RubricPlayground,
          handle: RubricPlayground.handle,
        };
      },
    },
  ],
});

export default questionsRouter;
