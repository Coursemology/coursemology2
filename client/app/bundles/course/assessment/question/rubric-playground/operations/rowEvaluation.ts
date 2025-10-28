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

export const exportEvaluations = async (
  rubricId: number,
): Promise<JobStatusResponse> => {
  try {
    const response =
      await CourseAPI.assessment.question.rubrics.exportEvaluations(rubricId);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data?.errors;

    throw error;
  }
};
