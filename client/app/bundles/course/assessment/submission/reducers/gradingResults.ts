// Reducer covering additional auto grading results on top of the grade itself
// (e.g. solution evaluation results for text response questions)

// TODO: Fold other auto grading results into this one
// (testCases for programming questions, categoryGrades for rubric-based response questions)
import { createReducer } from '@reduxjs/toolkit';
import { QuestionType } from 'types/course/assessment/question';
import { AnswerData } from 'types/course/assessment/submission/answer';
import { TextResponseSolutionResult } from 'types/course/assessment/submission/answer/textResponse';

import actions from '../constants';

interface GradingResultsState {
  solutionResults: Record<string, TextResponseSolutionResult[]>;
}

interface AnswerDataArrayAction {
  type:
    | typeof actions.FETCH_SUBMISSION_SUCCESS
    | typeof actions.FINALISE_SUCCESS
    | typeof actions.UNSUBMIT_SUCCESS
    | typeof actions.SAVE_ALL_GRADE_SUCCESS
    | typeof actions.SAVE_GRADE_SUCCESS
    | typeof actions.MARK_SUCCESS
    | typeof actions.UNMARK_SUCCESS
    | typeof actions.PUBLISH_SUCCESS;
  payload: {
    answers: AnswerData[];
  };
}

interface AnswerDataAction {
  type:
    | typeof actions.SAVE_ANSWER_SUCCESS
    | typeof actions.REEVALUATE_SUCCESS
    | typeof actions.AUTOGRADE_SUCCESS
    | typeof actions.RESET_SUCCESS;
  payload: AnswerData;
}

interface QuestionIdAction {
  type: typeof actions.REEVALUATE_FAILURE | typeof actions.AUTOGRADE_FAILURE;
  questionId: number;
}

interface UnknownAction {
  type: Exclude<
    string,
    | AnswerDataArrayAction['type']
    | AnswerDataAction['type']
    | QuestionIdAction['type']
  >;
}

type Action =
  | AnswerDataArrayAction
  | AnswerDataAction
  | QuestionIdAction
  | UnknownAction;

export default createReducer<GradingResultsState>(
  {
    solutionResults: {},
  },
  (builder) => {
    builder.addMatcher(
      (action: Action): action is AnswerDataArrayAction => {
        return [
          actions.FETCH_SUBMISSION_SUCCESS,
          actions.FINALISE_SUCCESS,
          actions.UNSUBMIT_SUCCESS,
          actions.SAVE_ALL_GRADE_SUCCESS,
          actions.SAVE_GRADE_SUCCESS,
          actions.MARK_SUCCESS,
          actions.UNMARK_SUCCESS,
          actions.PUBLISH_SUCCESS,
        ].includes(action.type);
      },
      (state, action) => {
        const newSolutionResults: Record<string, TextResponseSolutionResult[]> =
          {};
        action.payload.answers.forEach((answer) => {
          if (
            answer.questionType === QuestionType.TextResponse &&
            answer.solutionResults
          ) {
            newSolutionResults[answer.questionId] = answer.solutionResults;
          }
        });
        state.solutionResults = newSolutionResults;
      },
    );

    builder.addMatcher(
      (action: Action): action is AnswerDataAction => {
        return [
          actions.SAVE_ANSWER_SUCCESS,
          actions.REEVALUATE_SUCCESS,
          actions.AUTOGRADE_SUCCESS,
          actions.RESET_SUCCESS,
        ].includes(action.type);
      },
      (state, action) => {
        const answer = action.payload;
        if (
          answer.questionType === QuestionType.TextResponse &&
          answer.solutionResults
        ) {
          state.solutionResults[answer.questionId] = answer.solutionResults;
        }
      },
    );

    builder.addMatcher(
      (action: Action): action is QuestionIdAction => {
        return [actions.REEVALUATE_FAILURE, actions.AUTOGRADE_FAILURE].includes(
          action.type,
        );
      },
      (state, action) => {
        // Clear the previous test results in the test case results display.
        if (state.solutionResults[action.questionId]) {
          state.solutionResults[action.questionId] = state.solutionResults[
            action.questionId
          ].map((result) => ({
            ...result,
            grade: undefined,
            tests: result.tests?.map((test) => ({
              identifier: test.identifier,
              correct: false,
            })),
          }));
        }
      },
    );
  },
);
