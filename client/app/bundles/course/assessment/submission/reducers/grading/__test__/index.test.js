import { dispatch, store } from 'store';

import actions, { questionTypes } from '../../../constants';

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

describe('getPrefilledGrade via FETCH_SUBMISSION_SUCCESS', () => {
  describe('Question Types with ALWAYS_PREFILL_POLICY', () => {
    it('prefills maximum grade for an ungraded correct answer', () => {
      dispatchFetchSuccess(
        buildPayload({
          questionType: questionTypes.MultipleChoice,
          grade: null,
          correct: true,
        }),
      );

      expect(getGrade()).toBe(10);
    });

    it('prefills 0 for an ungraded incorrect answer', () => {
      dispatchFetchSuccess(
        buildPayload({
          questionType: questionTypes.MultipleChoice,
          grade: null,
          correct: false,
        }),
      );

      expect(getGrade()).toBe(0);
    });

    it('leaves grade as null when there is no explanation', () => {
      dispatchFetchSuccess(
        buildPayload({
          questionType: questionTypes.MultipleChoice,
          grade: null,
          correct: undefined,
        }),
      );

      expect(getGrade()).toBeNull();
    });

    it('preserves existing grades even if answer is correct', () => {
      dispatchFetchSuccess(
        buildPayload({
          questionType: questionTypes.MultipleChoice,
          grade: 5,
          correct: true,
        }),
      );

      expect(getGrade()).toBe(5);
    });

    it('preserves existing grade even if answer is incorrect', () => {
      dispatchFetchSuccess(
        buildPayload({
          questionType: questionTypes.MultipleChoice,
          grade: 8,
          correct: false,
        }),
      );

      expect(getGrade()).toBe(8);
    });
  });

  describe('Question Types with NEVER_PREFILL_POLICY', () => {
    it('does not prefill for an ungraded correct answer', () => {
      dispatchFetchSuccess(
        buildPayload({
          questionType: questionTypes.VoiceResponse,
          grade: null,
          correct: true,
        }),
      );

      expect(getGrade()).toBeNull();
    });

    it('does not prefill for an ungraded incorrect answer', () => {
      dispatchFetchSuccess(
        buildPayload({
          questionType: questionTypes.VoiceResponse,
          grade: null,
          correct: false,
        }),
      );

      expect(getGrade()).toBeNull();
    });

    it('preserves existing grades', () => {
      dispatchFetchSuccess(
        buildPayload({
          questionType: questionTypes.VoiceResponse,
          grade: 5,
          correct: true,
        }),
      );

      expect(getGrade()).toBe(5);
    });
  });

  describe('Question Types with ONLY_PREFILL_FULL_POLICY', () => {
    it('prefills maximum grade for an ungraded correct answer', () => {
      dispatchFetchSuccess(
        buildPayload({
          questionType: questionTypes.TextResponse,
          grade: null,
          correct: true,
        }),
      );

      expect(getGrade()).toBe(10);
    });

    it('does not prefill 0 for an ungraded incorrect answer', () => {
      dispatchFetchSuccess(
        buildPayload({
          questionType: questionTypes.TextResponse,
          grade: null,
          correct: false,
        }),
      );

      expect(getGrade()).toBeNull();
    });

    it('leaves grade as null when there is no explanation', () => {
      dispatchFetchSuccess(
        buildPayload({
          questionType: questionTypes.TextResponse,
          grade: null,
          correct: undefined,
        }),
      );

      expect(getGrade()).toBeNull();
    });

    it('preserves existing grades', () => {
      dispatchFetchSuccess(
        buildPayload({
          questionType: questionTypes.TextResponse,
          grade: 5,
          correct: true,
        }),
      );

      expect(getGrade()).toBe(5);
    });
  });

  describe('Programming', () => {
    const withTestCases = {
      public_test: [{ identifier: 'test1' }],
    };

    it('prefills maximum grade when test cases exist and answer is correct', () => {
      dispatchFetchSuccess(
        buildPayload({
          questionType: questionTypes.Programming,
          grade: null,
          correct: true,
          testCases: withTestCases,
        }),
      );

      expect(getGrade()).toBe(10);
    });

    it('does not prefill 0 when test cases exist and answer is incorrect', () => {
      dispatchFetchSuccess(
        buildPayload({
          questionType: questionTypes.Programming,
          grade: null,
          correct: false,
          testCases: withTestCases,
        }),
      );

      expect(getGrade()).toBeNull();
    });

    it('leaves grade as null when no test cases exist, even if answer is correct', () => {
      dispatchFetchSuccess(
        buildPayload({
          questionType: questionTypes.Programming,
          grade: null,
          correct: true,
          testCases: null,
        }),
      );

      expect(getGrade()).toBeNull();
    });
  });
});
