// Reducer covering additional auto grading results on top of the grade itself
// (e.g. solution evaluation results for text response questions, and the rubric category breakdown for
// rubric-graded questions -- both keyed by question id).

// TODO: Fold remaining auto grading results into this one (testCases for programming questions).
import { createReducer } from '@reduxjs/toolkit';
import { QuestionType } from 'types/course/assessment/question';
import { AnswerData } from 'types/course/assessment/submission/answer';
import { TextResponseSolutionResult } from 'types/course/assessment/submission/answer/textResponse';

import actions from '../constants';
import { CategoryGradeType } from '../types';

interface GradingResultsState {
  solutionResults: Record<string, TextResponseSolutionResult[]>;
  // Rubric grade breakdown keyed by question id (consistent with solutionResults). Present for any
  // rubric-graded answer; its presence drives the rubric UI in the submission view, regardless of type.
  categoryGrades: Record<number, CategoryGradeType[]>;
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

// UPDATE_RUBRIC (grader edits a category) / AUTOGRADE_RUBRIC_SUCCESS carry the affected question's id + its
// refreshed category breakdown.
interface RubricUpdateAction {
  type: typeof actions.UPDATE_RUBRIC | typeof actions.AUTOGRADE_RUBRIC_SUCCESS;
  payload: { questionId: number; categoryGrades: CategoryGradeType[] };
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
    | RubricUpdateAction['type']
  >;
}

type Action =
  | AnswerDataArrayAction
  | AnswerDataAction
  | QuestionIdAction
  | RubricUpdateAction
  | UnknownAction;

export default createReducer<GradingResultsState>(
  {
    solutionResults: {},
    categoryGrades: {},
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
        const newCategoryGrades: Record<number, CategoryGradeType[]> = {};
        action.payload.answers.forEach((answer) => {
          if (
            answer.questionType === QuestionType.TextResponse &&
            answer.solutionResults
          ) {
            newSolutionResults[answer.questionId] = answer.solutionResults;
          }
          if (answer.categoryGrades) {
            newCategoryGrades[answer.questionId] = answer.categoryGrades;
          }
        });
        state.solutionResults = newSolutionResults;
        state.categoryGrades = newCategoryGrades;
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
        if (answer.categoryGrades) {
          state.categoryGrades[answer.questionId] = answer.categoryGrades;
        }
      },
    );

    builder.addMatcher(
      (action: Action): action is RubricUpdateAction => {
        return [
          actions.UPDATE_RUBRIC,
          actions.AUTOGRADE_RUBRIC_SUCCESS,
        ].includes(action.type);
      },
      (state, action) => {
        state.categoryGrades[action.payload.questionId] =
          action.payload.categoryGrades;
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
