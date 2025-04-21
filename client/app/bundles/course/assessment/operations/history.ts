import { dispatch } from 'store';
import { QuestionType } from 'types/course/assessment/question';
import { SubmissionQuestionDetails } from 'types/course/assessment/submission/submission-question';

import CourseAPI from 'api/course';

import {
  historyActions,
  HistoryFetchStatus,
} from '../submission/reducers/history';
import { AnswerDataWithQuestion } from '../submission/types';

export const fetchSubmissionQuestionDetails = async (
  submissionId: number,
  questionId: number,
): Promise<SubmissionQuestionDetails> => {
  const response =
    await CourseAPI.assessment.allAnswers.fetchSubmissionQuestionDetails(
      submissionId,
      questionId,
    );

  return response.data;
};

export const fetchAnswer = async (
  submissionId: number,
  answerId: number,
): Promise<AnswerDataWithQuestion<keyof typeof QuestionType>> => {
  const response = await CourseAPI.assessment.submissions.fetchAnswer(
    submissionId,
    answerId,
  );

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
      status: HistoryFetchStatus.SUBMITTED,
    }),
  );
  return fetchAnswer(submissionId, answerId)
    .then((details) => {
      dispatch(
        historyActions.updateSingleAnswerHistory({
          questionId,
          answerId,
          submissionId,
          details,
          status: HistoryFetchStatus.COMPLETED,
        }),
      );
    })
    .catch(() => {
      dispatch(
        historyActions.updateSingleAnswerHistory({
          questionId,
          answerId,
          submissionId,
          status: HistoryFetchStatus.ERRORED,
        }),
      );
    });
};
