import { AppState } from 'store';
import { QuestionType } from 'types/course/assessment/question';
import { SubmissionQuestionData } from 'types/course/assessment/submission/question/types';
import {
  AllAnswerItem,
  CommentItem,
} from 'types/course/assessment/submission/submission-question';

import {
  AnswerDetailsState,
  HistoryFetchStatus,
  SubmissionHistoryState,
} from '../reducers/history';

const getLocalState = (state: AppState): SubmissionHistoryState => {
  return state.assessments.submission.history;
};

export const getSubmissionQuestionHistory =
  (submissionId: number, questionId: number) =>
  (
    state: AppState,
  ): {
    allAnswers: AllAnswerItem[];
    answerDataById: Record<
      number,
      AnswerDetailsState<keyof typeof QuestionType>
    >;
    selectedAnswerIds: number[];
    question?: SubmissionQuestionData<keyof typeof QuestionType>;
    canViewHistory: boolean;
    comments: CommentItem[];
    status?: HistoryFetchStatus;
  } => {
    const history = getLocalState(state);
    return {
      status: history[submissionId]?.[questionId]?.status,
      allAnswers:
        history[submissionId]?.[questionId]?.details?.allAnswers ?? [],
      answerDataById:
        history[submissionId]?.[questionId]?.details?.answerDataById ?? {},
      selectedAnswerIds:
        history[submissionId]?.[questionId]?.details
          ?.sequenceViewSelectedAnswerIds ?? [],
      question: history[submissionId]?.[questionId]?.details?.question,
      canViewHistory:
        history[submissionId]?.[questionId]?.details?.canViewHistory ?? false,
      comments: history[submissionId]?.[questionId]?.details?.comments ?? [],
    };
  };
