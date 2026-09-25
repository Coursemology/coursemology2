// Reducer covering additional auto grading results on top of the numeric grade, namely:
// - solution evaluation results for text response questions
// - rubric category grade breakdown for rubric-graded questions
// - test case breakdown for programming questions
// All of these are keyed by question id, and their presence drives the corresponding UI in the submission view.
import { createReducer } from '@reduxjs/toolkit';
import { QuestionType } from 'types/course/assessment/question';
import { AnswerData } from 'types/course/assessment/submission/answer';
import {
  ProgrammingAnswerData,
  TestCasesState,
} from 'types/course/assessment/submission/answer/programming';
import { TextResponseSolutionResult } from 'types/course/assessment/submission/answer/textResponse';

import actions from '../constants';
import { CategoryGradeType } from '../types';

interface GradingResultsState {
  solutionResults: Record<string, TextResponseSolutionResult[]>;
  categoryGrades: Record<number, CategoryGradeType[]>;
  testCases: Record<number, TestCasesState>;
}

const testCasesFromAnswer = (
  answer: ProgrammingAnswerData,
): TestCasesState => ({
  canReadTests: answer.canReadTests,
  testCases: answer.testCases,
  testResults: answer.testResults,
  stdout: answer.stdout,
  stderr: answer.stderr,
});

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
// refreshed category breakdown. AUTOGRADE_RUBRIC_SUCCESS may omit the breakdown (a student before publication
// receives only the AI feedback comment), in which case the existing breakdown stands.
interface RubricUpdateAction {
  type: typeof actions.UPDATE_RUBRIC | typeof actions.AUTOGRADE_RUBRIC_SUCCESS;
  payload: { questionId: number; categoryGrades?: CategoryGradeType[] };
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
    testCases: {},
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
          if (answer.questionType === QuestionType.Programming) {
            // Merged rather than replaced wholesale: not every action matched here carries an entry
            // for every question, and dropping a question's test cases empties its panel.
            state.testCases[answer.questionId] = testCasesFromAnswer(answer);
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
        if (answer.questionType === QuestionType.Programming) {
          state.testCases[answer.questionId] = testCasesFromAnswer(answer);
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
        if (!action.payload.categoryGrades) return;

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
        // Clear the previous test results, keeping the test case definitions so the panel still
        // lists what would have been run.
        if (state.testCases[action.questionId]) {
          delete state.testCases[action.questionId].testResults;
          delete state.testCases[action.questionId].stdout;
          delete state.testCases[action.questionId].stderr;
        }
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
