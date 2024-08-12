import { Resolver } from 'react-hook-form';
import { AnswerData } from 'types/course/assessment/submission/answer';

import { AttachmentsState, QuestionsState } from '../../types';

import { validateBasedOnQuestionType } from './validations/AllValidation';

export const errorResolver = (
  questions: QuestionsState,
  questionAttachments: AttachmentsState,
): Resolver<Record<number, AnswerData>> => {
  return async (data) => {
    const allErrors = {};
    Object.entries(data).forEach(([answerId, answer]) => {
      const { questionId } = answer;
      const errors = validateBasedOnQuestionType(
        questions[questionId],
        questionAttachments[questionId],
      );

      if (errors.errorTypes.length > 0) {
        allErrors[answerId] = errors;
      }
    });
    return {
      values: data,
      errors: allErrors,
    };
  };
};
