import { dispatch } from 'store';
import { QuestionType } from 'types/course/assessment/question';

import CourseAPI from 'api/course';

import { historyActions } from '../submission/reducers/history';
import { AnswerDataWithQuestion } from '../submission/types';

export const fetchAnswer = async (
  answerId: number,
): Promise<AnswerDataWithQuestion<keyof typeof QuestionType>> => {
  const response = await CourseAPI.statistics.answer.fetch(answerId);

  return response.data;
};

export const tryFetchAnswerById = (
  submissionId: number,
  questionId: number,
  answerId: number,
): Promise<void> => {
  dispatch(
    historyActions.updateSingleAnswerHistory({
      questionId,
      answerId,
      submissionId,
      details: null,
      status: 'submitted',
    }),
  );
  return fetchAnswer(answerId)
    .then((details) => {
      dispatch(
        historyActions.updateSingleAnswerHistory({
          questionId,
          answerId,
          submissionId,
          details,
          status: 'completed',
        }),
      );
    })
    .catch(() => {
      dispatch(
        historyActions.updateSingleAnswerHistory({
          questionId,
          answerId,
          submissionId,
          details: null,
          status: 'errored',
        }),
      );
    });
};
