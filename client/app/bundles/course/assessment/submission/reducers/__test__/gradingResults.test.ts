import { QuestionType } from 'types/course/assessment/question';
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
});
