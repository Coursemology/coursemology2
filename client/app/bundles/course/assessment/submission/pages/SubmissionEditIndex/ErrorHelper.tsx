import { Resolver } from 'react-hook-form';
import { QuestionType } from 'types/course/assessment/question';
import { AnswerData } from 'types/course/assessment/submission/answer';
import { SubmissionQuestionData } from 'types/course/assessment/submission/question/types';

import { Attachment } from '../../components/answers/types';

import { validateBasedOnQuestionType } from './validations/AllValidation';

export const errorResolver = (
  questions: SubmissionQuestionData<keyof typeof QuestionType>[],
  questionAttachments: Record<number, Attachment[]>,
): Resolver<Record<number, AnswerData>> => {
  return async (data) => {
    const errors = {};
    Object.entries(data).forEach(([_answerId, answer]) => {
      validateBasedOnQuestionType(
        errors,
        answer,
        questions,
        questionAttachments[answer.questionId],
      );
    });
    return {
      values: {},
      errors,
    };
  };
};
