import { QuestionType } from 'types/course/assessment/question';
import { AnswerData } from 'types/course/assessment/submission/answer';
import { ProgrammingAnswerData } from 'types/course/assessment/submission/answer/programming';

import actions from '../../constants';
import reducer from '../gradingResults';

const buildProgrammingAnswer = (
  overrides: Partial<ProgrammingAnswerData> = {},
): ProgrammingAnswerData =>
  ({
    questionId: 1,
    questionType: QuestionType.Programming,
    canReadTests: false,
    testCases: { public_test: [{ id: 7, expression: 'f()', expected: '1' }] },
    testResults: { public_test: { 7: { id: 7, passed: true } } },
    ...overrides,
  }) as ProgrammingAnswerData;

describe('gradingResults reducer', () => {
  const initialState = reducer(undefined, { type: '@@INIT' });

  it('keeps whether an answer was graded against an earlier version of its question', () => {
    const state = reducer(initialState, {
      type: actions.FETCH_SUBMISSION_SUCCESS,
      payload: {
        answers: [buildProgrammingAnswer({ gradedOnPreviousVersion: true })],
      },
    });

    expect(state.testCases[1].gradedOnPreviousVersion).toBe(true);
  });

  it('clears the flag when a regrade is graded against the current version', () => {
    const fetched = reducer(initialState, {
      type: actions.FETCH_SUBMISSION_SUCCESS,
      payload: {
        answers: [buildProgrammingAnswer({ gradedOnPreviousVersion: true })],
      },
    });
    const regraded = reducer(fetched, {
      type: actions.AUTOGRADE_SUCCESS,
      payload: buildProgrammingAnswer({ gradedOnPreviousVersion: false }),
    });

    expect(regraded.testCases[1].gradedOnPreviousVersion).toBe(false);
  });

  // Saving one question's grade returns only that answer; other questions' rubric panels must survive it.
  it("merges a single question's saved grade without wiping other questions' results", () => {
    const categoryGrades = (grade: number): AnswerData['categoryGrades'] => [
      { id: grade, categoryId: 1, gradeId: grade, grade, explanation: null },
    ];
    const rubricAnswer = (questionId: number, grade: number): AnswerData =>
      ({
        questionId,
        questionType: QuestionType.ForumPostResponse,
        categoryGrades: categoryGrades(grade),
      }) as AnswerData;

    const fetched = reducer(initialState, {
      type: actions.FETCH_SUBMISSION_SUCCESS,
      payload: {
        answers: [
          rubricAnswer(1, 1),
          rubricAnswer(2, 1),
          buildProgrammingAnswer({ questionId: 3 }),
        ],
      },
    });
    const saved = reducer(fetched, {
      type: actions.SAVE_GRADE_SUCCESS,
      payload: { answers: [rubricAnswer(1, 2)] },
    });

    expect(saved.categoryGrades[1]).toEqual(categoryGrades(2));
    expect(saved.categoryGrades[2]).toEqual(categoryGrades(1));
    expect(saved.testCases[3]).toBeDefined();
  });
});
