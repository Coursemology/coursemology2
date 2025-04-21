import { createSlice, current, PayloadAction } from '@reduxjs/toolkit';
import { QuestionType } from 'types/course/assessment/question';
import { SubmissionQuestionData } from 'types/course/assessment/submission/question/types';
import {
  AllAnswerItem,
  CommentItem,
} from 'types/course/assessment/submission/submission-question';

import { defaultPastAnswersDisplayed } from '../../constants';
import { AnswerDataWithQuestion, AnswerDetailsMap } from '../../types';

export enum HistoryFetchStatus {
  SUBMITTED = 'submitted',
  COMPLETED = 'completed',
  ERRORED = 'errored',
}

export interface AnswerDetailsState<T extends keyof typeof QuestionType> {
  details: AnswerDetailsMap[T] | undefined;
  status: HistoryFetchStatus;
}

export interface SubmissionQuestionHistoryData<
  T extends keyof typeof QuestionType,
> {
  allAnswers: AllAnswerItem[];
  answerDataById: Record<number, AnswerDetailsState<T>>;
  sequenceViewSelectedAnswerIds: number[];
  comments: CommentItem[];

  // Flag from BE on whether the given question type supports rendering past answers
  canViewHistory: boolean;

  // We query question data with the answer because the answer can affect how the question is displayed
  // (e.g. option randomization for mcq/mrq questions). However, we can take advantage of the fact that
  // the question should remain the same across all answers.
  question?: SubmissionQuestionData<T>;
}

export interface SubmissionQuestionHistoryState {
  status: HistoryFetchStatus;
  details?: SubmissionQuestionHistoryData<keyof typeof QuestionType>;
}

export type SubmissionHistoryState = Record<
  number,
  Record<number, SubmissionQuestionHistoryState>
>;

const initialState: SubmissionHistoryState = {};

export const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    initSubmissionHistory: (
      state,
      action: PayloadAction<{
        submissionId: number;
        questionHistories: {
          id: number;
          answers: AllAnswerItem[];
          canViewHistory: boolean;
        }[];
        questions: {
          id: number;
          canViewHistory: boolean;
        }[];
      }>,
    ) => {
      const { submissionId, questionHistories, questions } = action.payload;
      const canViewHistoryMapper = questions.reduce<Record<number, boolean>>(
        (mapper, question) => ({
          ...mapper,
          [question.id]: question.canViewHistory,
        }),
        {},
      );

      const fetchedStates = questionHistories.reduce<
        Record<number, SubmissionQuestionHistoryState>
      >(
        (histories, questionHistory) => ({
          ...histories,
          [questionHistory.id]: {
            status: HistoryFetchStatus.COMPLETED,
            details: {
              allAnswers: questionHistory.answers ?? [],
              canViewHistory: canViewHistoryMapper[questionHistory.id] ?? false,
              sequenceViewSelectedAnswerIds: questionHistory.answers
                ?.toReversed()
                .slice(0, defaultPastAnswersDisplayed)
                .map((answer) => answer.id),
              comments: [],
              answerDataById: {},
            },
          },
        }),
        {},
      );

      const freshQuestions = questions.filter(
        (question) => !(question.id in fetchedStates),
      );
      state[submissionId] = freshQuestions.reduce(
        (histories, question) => ({
          ...histories,
          [question.id]: {
            status: HistoryFetchStatus.COMPLETED,
            details: {
              allAnswers: [],
              canViewHistory: canViewHistoryMapper[question.id],
              sequenceViewSelectedAnswerIds: [],
              comments: [],
              answerDataById: {},
            },
          },
        }),
        fetchedStates,
      );
    },
    updateSubmissionQuestionHistory: (
      state,
      action: PayloadAction<{
        submissionId: number;
        questionId: number;
        status: HistoryFetchStatus;
        details?: Partial<
          SubmissionQuestionHistoryData<keyof typeof QuestionType>
        >;
      }>,
    ) => {
      const { submissionId, questionId, ...submissionQuestionState } =
        action.payload;
      const existingState = current(state)[submissionId]?.[questionId];
      state[submissionId] = {
        ...state[submissionId],
        [questionId]: {
          status: submissionQuestionState.status,
          details: {
            canViewHistory:
              submissionQuestionState.details?.canViewHistory ?? false,
            allAnswers:
              submissionQuestionState?.details?.allAnswers ??
              existingState?.details?.allAnswers ??
              [],
            answerDataById:
              submissionQuestionState?.details?.answerDataById ??
              existingState?.details?.answerDataById ??
              {},
            sequenceViewSelectedAnswerIds:
              submissionQuestionState?.details?.sequenceViewSelectedAnswerIds ??
              submissionQuestionState?.details?.allAnswers
                ?.toReversed()
                .slice(0, defaultPastAnswersDisplayed)
                .map((answer) => answer.id) ??
              existingState?.details?.sequenceViewSelectedAnswerIds ??
              [],
            comments:
              submissionQuestionState?.details?.comments ??
              existingState?.details?.comments ??
              [],
            // common question data is set by updateSingleAnswerHistory for all listed answers
            // therefore if the list changes, it must be unset
            question: undefined,
          },
        },
      };
    },
    // Push a (newer) answer item to the end of the allAnswers array.
    // Called when autograding a new answer on the active submission is completed.
    pushSingleAnswerItem: (
      state,
      action: PayloadAction<{
        submissionId: number;
        questionId: number;
        answerItem: AllAnswerItem;
      }>,
    ) => {
      const { submissionId, questionId, answerItem } = action.payload;
      const submissionQuestionState = state[submissionId]?.[questionId];
      if (submissionQuestionState?.details) {
        submissionQuestionState.details.allAnswers.push(answerItem);
        submissionQuestionState.details.sequenceViewSelectedAnswerIds.unshift(
          answerItem.id,
        );
      }
    },
    updateSingleAnswerHistory: (
      state,
      action: PayloadAction<{
        submissionId: number;
        questionId: number;
        answerId: number;
        details?: AnswerDataWithQuestion<keyof typeof QuestionType>;
        status: HistoryFetchStatus;
      }>,
    ) => {
      const { submissionId, questionId, answerId, details, status } =
        action.payload;
      const submissionQuestionState = state[submissionId]?.[questionId];
      if (submissionQuestionState?.details) {
        if (details) {
          const { question: questionDetails, ...answerDetails } = details;
          submissionQuestionState.details.answerDataById[answerId] = {
            status,
            details: answerDetails,
          };
          submissionQuestionState.details.question = questionDetails;
        } else {
          submissionQuestionState.details.answerDataById[answerId] = {
            status,
            details,
          };
        }
      }
    },
    updateSelectedAnswerIds: (
      state,
      action: PayloadAction<{
        submissionId: number;
        questionId: number;
        selectedAnswerIds: number[];
      }>,
    ) => {
      const { submissionId, questionId, selectedAnswerIds } = action.payload;
      if (state[submissionId]?.[questionId]?.details) {
        state[submissionId][questionId].details!.sequenceViewSelectedAnswerIds =
          state[submissionId][questionId]
            .details!.allAnswers.filter((answer) =>
              selectedAnswerIds.includes(answer.id),
            )
            .map((answer) => answer.id)
            .toReversed();
      }
    },
  },
});

export const historyActions = historySlice.actions;

export default historySlice.reducer;
