import { AxiosError } from 'axios';
import { AppDispatch } from 'store';
import { JobStatusResponse } from 'types/jobs';

import CourseAPI from 'api/course';

import { actions as questionRubricsActions } from '../../reducers/rubrics';
import { AnswerTableEntry } from '../AnswerEvaluationsTable/types';

import { deleteAnswerEvaluation, evaluatePlaygroundAnswer } from './answers';
import {
  deleteMockAnswerEvaluation,
  evaluatePlaygroundMockAnswer,
} from './mockAnswers';

export const requestRowEvaluation = (
  dispatch: AppDispatch,
  answer: AnswerTableEntry,
  rubricId: number,
): void => {
  if (answer.isMock) {
    dispatch(
      questionRubricsActions.requestMockAnswerEvaluation({
        mockAnswerId: answer.id,
        rubricId,
      }),
    );
    evaluatePlaygroundMockAnswer(rubricId, answer.id).then((evaluation) => {
      dispatch(
        questionRubricsActions.updateMockAnswerEvaluation({
          mockAnswerId: answer.id,
          rubricId,
          evaluation,
        }),
      );
    });
  } else {
    dispatch(
      questionRubricsActions.requestAnswerEvaluation({
        answerId: answer.id,
        rubricId,
      }),
    );
    evaluatePlaygroundAnswer(rubricId, answer.id).then((evaluation) => {
      dispatch(
        questionRubricsActions.updateAnswerEvaluation({
          answerId: answer.id,
          rubricId,
          evaluation,
        }),
      );
    });
  }
};

export const deleteRowEvaluation = (
  dispatch: AppDispatch,
  answer: AnswerTableEntry,
  rubricId: number,
): void => {
  if (answer.isMock) {
    deleteMockAnswerEvaluation(rubricId, answer.id).then(() => {
      dispatch(
        questionRubricsActions.deleteMockAnswerEvaluation({
          mockAnswerId: answer.id,
          rubricId,
        }),
      );
    });
  } else {
    deleteAnswerEvaluation(rubricId, answer.id).then(() => {
      dispatch(
        questionRubricsActions.deleteAnswerEvaluation({
          answerId: answer.id,
          rubricId,
        }),
      );
    });
  }
};

// Thrown when the backend rejects an apply because some selected answers have no evaluation yet. The
// caller can catch this to ask the user to confirm, then retry with `applyUnevaluated = true`.
export class UnevaluatedAnswersError extends Error {}

export const applyEvaluations = async (
  rubricId: number,
  answerIds: number[],
  applyUnevaluated: boolean,
): Promise<JobStatusResponse> => {
  try {
    const response =
      await CourseAPI.assessment.question.rubrics.applyEvaluations(
        rubricId,
        answerIds,
        applyUnevaluated,
      );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      // The "some answers are unevaluated" guard responds 400 with a single `error` message.
      if (
        error.response?.status === 400 &&
        error.response?.data?.error?.includes('unevaluated')
      ) {
        throw new UnevaluatedAnswersError(error.response.data.error);
      }
      throw error.response?.data?.errors;
    }

    throw error;
  }
};
