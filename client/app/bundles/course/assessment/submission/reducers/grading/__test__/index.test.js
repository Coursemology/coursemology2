import { dispatch, store } from 'store';

import actions, { questionTypes } from '../../../constants';

const getPrefillStatus = () =>
  store.getState().assessments.submission.grading.questions[1].prefillStatus;

const getPrefilled = () =>
  store.getState().assessments.submission.grading.questions[1].prefilled;

const answerId = 3;

const buildPayload = ({ questionType, grade, correct, testCases } = {}) => ({
  submission: {
    pointsAwarded: null,
    basePoints: 1000,
    submittedAt: '2017-05-11T17:02:17.000+08:00',
    bonusEndAt: '2017-05-11T17:02:17.000+08:00',
    bonusPoints: 0,
  },
  assessment: {},
  annotations: [],
  posts: [],
  topics: [],
  questions: [{ id: 1, type: questionType, maximumGrade: 10 }],
  answers: [
    {
      id: answerId,
      fields: {
        id: answerId,
        questionId: 1,
      },
      questionId: 1,
      grading: {
        grade,
        id: answerId,
      },
      explanation: correct !== undefined ? { correct } : undefined,
      testCases,
    },
  ],
});

const dispatchFetchSuccess = (payload) =>
  dispatch({ type: actions.FETCH_SUBMISSION_SUCCESS, payload });

const getGrade = () =>
  store.getState().assessments.submission.grading.questions[1].grade;

describe('getPrefillResult via FETCH_SUBMISSION_SUCCESS', () => {
  describe('general behavior', () => {
    it('preserves existing grade and sets prefillStatus to none even if answer is correct', () => {
      dispatchFetchSuccess(
        buildPayload({
          questionType: questionTypes.MultipleChoice,
          grade: 5,
          correct: true,
        }),
      );

      expect(getGrade()).toBe(5);
      expect(getPrefillStatus()).toBe('none');
      expect(getPrefilled()).toBe(false);
    });

    it('preserves existing grade and sets prefillStatus to none even if answer is incorrect', () => {
      dispatchFetchSuccess(
        buildPayload({
          questionType: questionTypes.MultipleChoice,
          grade: 8,
          correct: false,
        }),
      );

      expect(getGrade()).toBe(8);
      expect(getPrefillStatus()).toBe('none');
      expect(getPrefilled()).toBe(false);
    });

    it('leaves grade as null and sets prefillStatus to none when there is no explanation', () => {
      dispatchFetchSuccess(
        buildPayload({
          questionType: questionTypes.MultipleChoice,
          grade: null,
          correct: undefined,
        }),
      );

      expect(getGrade()).toBeNull();
      expect(getPrefillStatus()).toBe('none');
      expect(getPrefilled()).toBe(false);
    });
  });

  describe('Question Types with ALWAYS_PREFILL_POLICY', () => {
    it('prefills maximum grade and sets prefillStatus to full for an ungraded correct answer', () => {
      dispatchFetchSuccess(
        buildPayload({
          questionType: questionTypes.MultipleChoice,
          grade: null,
          correct: true,
        }),
      );

      expect(getGrade()).toBe(10);
      expect(getPrefillStatus()).toBe('full');
      expect(getPrefilled()).toBe(true);
    });

    it('prefills 0 and sets prefillStatus to zero for an ungraded incorrect answer', () => {
      dispatchFetchSuccess(
        buildPayload({
          questionType: questionTypes.MultipleChoice,
          grade: null,
          correct: false,
        }),
      );

      expect(getGrade()).toBe(0);
      expect(getPrefillStatus()).toBe('zero');
      expect(getPrefilled()).toBe(true);
    });
  });

  describe('Question Types with NEVER_PREFILL_POLICY', () => {
    it('leaves grade as null and sets prefillStatus to none for an ungraded correct answer', () => {
      dispatchFetchSuccess(
        buildPayload({
          questionType: questionTypes.VoiceResponse,
          grade: null,
          correct: true,
        }),
      );

      expect(getGrade()).toBeNull();
      expect(getPrefillStatus()).toBe('none');
      expect(getPrefilled()).toBe(false);
    });

    it('leaves grade as null and sets prefillStatus to none for an ungraded incorrect answer', () => {
      dispatchFetchSuccess(
        buildPayload({
          questionType: questionTypes.VoiceResponse,
          grade: null,
          correct: false,
        }),
      );

      expect(getGrade()).toBeNull();
      expect(getPrefillStatus()).toBe('none');
      expect(getPrefilled()).toBe(false);
    });
  });

  describe('Question Types with ONLY_PREFILL_FULL_POLICY', () => {
    it('prefills maximum grade and sets prefillStatus to full for an ungraded correct answer', () => {
      dispatchFetchSuccess(
        buildPayload({
          questionType: questionTypes.TextResponse,
          grade: null,
          correct: true,
        }),
      );

      expect(getGrade()).toBe(10);
      expect(getPrefillStatus()).toBe('full');
      expect(getPrefilled()).toBe(true);
    });

    it('leaves grade as null and sets prefillStatus to none for an ungraded incorrect answer', () => {
      dispatchFetchSuccess(
        buildPayload({
          questionType: questionTypes.TextResponse,
          grade: null,
          correct: false,
        }),
      );

      expect(getGrade()).toBeNull();
      expect(getPrefillStatus()).toBe('none');
      expect(getPrefilled()).toBe(false);
    });
  });

  describe('Programming', () => {
    const withTestCases = {
      public_test: [{ identifier: 'test1' }],
    };

    it('prefills maximum grade and sets prefillStatus to full when test cases exist and answer is correct', () => {
      dispatchFetchSuccess(
        buildPayload({
          questionType: questionTypes.Programming,
          grade: null,
          correct: true,
          testCases: withTestCases,
        }),
      );

      expect(getGrade()).toBe(10);
      expect(getPrefillStatus()).toBe('full');
      expect(getPrefilled()).toBe(true);
    });

    it('leaves grade as null and sets prefillStatus to none when test cases exist and answer is incorrect', () => {
      dispatchFetchSuccess(
        buildPayload({
          questionType: questionTypes.Programming,
          grade: null,
          correct: false,
          testCases: withTestCases,
        }),
      );

      expect(getGrade()).toBeNull();
      expect(getPrefillStatus()).toBe('none');
      expect(getPrefilled()).toBe(false);
    });

    it('prefills maximum grade when only private_test cases exist and answer is correct', () => {
      dispatchFetchSuccess(
        buildPayload({
          questionType: questionTypes.Programming,
          grade: null,
          correct: true,
          testCases: { private_test: [{ identifier: 'test1' }] },
        }),
      );

      expect(getGrade()).toBe(10);
      expect(getPrefillStatus()).toBe('full');
      expect(getPrefilled()).toBe(true);
    });

    it('prefills maximum grade when only evaluation_test cases exist and answer is correct', () => {
      dispatchFetchSuccess(
        buildPayload({
          questionType: questionTypes.Programming,
          grade: null,
          correct: true,
          testCases: { evaluation_test: [{ identifier: 'test1' }] },
        }),
      );

      expect(getGrade()).toBe(10);
      expect(getPrefillStatus()).toBe('full');
      expect(getPrefilled()).toBe(true);
    });

    it('leaves grade as null and sets prefillStatus to none when no test cases exist, even if answer is correct', () => {
      dispatchFetchSuccess(
        buildPayload({
          questionType: questionTypes.Programming,
          grade: null,
          correct: true,
          testCases: null,
        }),
      );

      expect(getGrade()).toBeNull();
      expect(getPrefillStatus()).toBe('none');
      expect(getPrefilled()).toBe(false);
    });
  });
});

describe('SAVE_GRADE_SUCCESS', () => {
  it('preserves prefillStatus after a grade is saved', () => {
    dispatchFetchSuccess(
      buildPayload({
        questionType: questionTypes.MultipleChoice,
        grade: null,
        correct: true,
      }),
    );

    expect(getPrefillStatus()).toBe('full');

    dispatch({
      type: actions.SAVE_GRADE_SUCCESS,
      payload: {
        submission: { pointsAwarded: 10, basePoints: 1000 },
        questions: [{ id: 1, maximumGrade: 10 }],
        annotations: [],
        answers: [
          {
            id: answerId,
            fields: { id: answerId, questionId: 1 },
            questionId: 1,
            grading: { grade: 10, id: answerId },
            explanation: { correct: true },
          },
        ],
      },
    });

    expect(getPrefillStatus()).toBe('full');
    expect(getPrefilled()).toBe(true);
  });
});

describe('UPDATE_GRADING', () => {
  it('resets grade, prefillStatus, and prefilled after manual edit', () => {
    dispatchFetchSuccess(
      buildPayload({
        questionType: questionTypes.MultipleChoice,
        grade: null,
        correct: true,
      }),
    );

    dispatch({
      type: actions.UPDATE_GRADING,
      id: 1,
      grade: 7,
      bonusAwarded: 0,
    });

    expect(getGrade()).toBe(7);
    expect(getPrefillStatus()).toBe('none');
    expect(getPrefilled()).toBe(false);
  });
});
