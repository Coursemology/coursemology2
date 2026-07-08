/* eslint-disable no-param-reassign */
import { produce } from 'immer';
import { arrayToObjectWithKey } from 'utilities/array';

import actions, { questionTypes } from '../../constants';

/**
 * Represents a student's answer to a question, as returned by the server.
 *
 * @typedef {Object} Answer
 * @property {number} questionId
 * @property {{ grade: number|null, id: number }} grading
 * @property {{ correct: boolean }} [explanation]
 * @property {Object} [testCases]
 */

/**
 * Defines the prefill behaviour for a question type.
 * `isFullCreditPrefillable` determines whether the maximum grade should be prefilled for a correct answer.
 * `isZeroCreditPrefillable` determines whether 0 should be prefilled for an incorrect answer.
 *
 * @typedef {{ isFullCreditPrefillable: (answer: Answer) => boolean, isZeroCreditPrefillable: boolean }} PrefillPolicy
 */

/**
 * The initial Redux state for the grading slice.
 *
 * @type {{ questions: Record<number, Object>, expMultiplier: number, exp: number, basePoints: number,
 *   maximumGrade: number }}
 */
const initialState = {
  questions: {},
  expMultiplier: 1,
  exp: 0,
  basePoints: 0,
  maximumGrade: 0,
};

/**
 * Sums all truthy values in an array, ignoring nulls and undefineds.
 *
 * @param {Array<number|null|undefined>} array
 * @returns {number}
 */
const sum = (array) => array.filter((i) => i).reduce((acc, i) => acc + i, 0);

/**
 * Computes the EXP awarded for a submission based on the total grade achieved.
 *
 * @param {Record<number, { grade: number|null }>} questions
 * @param {number} maximumGrade
 * @param {number} basePoints
 * @param {number} expMultiplier
 * @param {number} [bonusAwarded]
 * @returns {number}
 */
export const computeExp = (
  questions,
  maximumGrade,
  basePoints,
  expMultiplier,
  bonusAwarded = 0,
) => {
  const totalGrade = sum(
    Object.values(questions).map((q) => parseFloat(q.grade)),
  );
  return Math.round(
    (totalGrade / maximumGrade) * (basePoints + bonusAwarded) * expMultiplier,
  );
};

/**
 * Extracts grades from a list of answers, keyed by question ID.
 *
 * @param {Answer[]} answers
 * @returns {Record<number, Object>}
 */
const extractGrades = (answers) =>
  answers.reduce((draft, { questionId, grading }) => {
    draft[questionId] = {
      ...grading,
      originalGrade: grading.grade,
    };

    return draft;
  }, {});

/**
 * Never prefills any grade regardless of correctness.
 * Used for question types where auto-grading is not applicable.
 *
 * @type {PrefillPolicy}
 */
const NEVER_PREFILL_POLICY = {
  isFullCreditPrefillable: () => false,
  isZeroCreditPrefillable: false,
};

/**
 * Prefills maximum grade for correct answers and 0 for incorrect answers.
 * Used for question types with no partial credit.
 *
 * @type {PrefillPolicy}
 */
const ALWAYS_PREFILL_POLICY = {
  isFullCreditPrefillable: () => true,
  isZeroCreditPrefillable: true,
};

/**
 * Prefills maximum grade for correct answers, but does not prefill 0 for incorrect answers.
 * Used for question types where partial credit is possible.
 *
 * @type {PrefillPolicy}
 */
const ONLY_PREFILL_FULL_POLICY = {
  isFullCreditPrefillable: () => true,
  isZeroCreditPrefillable: false,
};

/**
 * Prefills maximum grade for correct programming answers only when test cases exist.
 * Does not prefill 0 since partial grading is possible.
 *
 * @type {PrefillPolicy}
 */
const PROGRAMMING_PREFILL_POLICY = {
  isFullCreditPrefillable: ({ testCases }) =>
    (testCases?.public_test?.length ?? 0) > 0 ||
    (testCases?.private_test?.length ?? 0) > 0 ||
    (testCases?.evaluation_test?.length ?? 0) > 0,

  // Partial grading is possible
  isZeroCreditPrefillable: false,
};

/**
 * Maps each question type to its prefill policy.
 *
 * @type {Record<string, PrefillPolicy>}
 */
const PrefillPolicyMapper = {
  [questionTypes.MultipleChoice]: ALWAYS_PREFILL_POLICY,
  [questionTypes.MultipleResponse]: ONLY_PREFILL_FULL_POLICY,
  [questionTypes.Programming]: PROGRAMMING_PREFILL_POLICY,
  [questionTypes.TextResponse]: ONLY_PREFILL_FULL_POLICY,
  [questionTypes.Comprehension]: ONLY_PREFILL_FULL_POLICY,
  [questionTypes.FileUpload]: NEVER_PREFILL_POLICY,
  [questionTypes.Scribing]: NEVER_PREFILL_POLICY,
  [questionTypes.VoiceResponse]: NEVER_PREFILL_POLICY,
  [questionTypes.ForumPostResponse]: NEVER_PREFILL_POLICY,
  [questionTypes.RubricBasedResponse]: NEVER_PREFILL_POLICY,
};

/**
 * Returns the grade to prefill for an answer based on its question type's policy.
 * Returns the existing grade if one is already set, otherwise applies the policy.
 * Returns null if no prefill is applicable.
 *
 * @param {Answer} answer
 * @param {string} questionType
 * @param {number} maxGrade
 * @returns {{ grade: number|null, prefillStatus: string }}
 */
const getPrefillResult = (answer, questionType, maxGrade) => {
  const existingGrade = answer?.grading?.grade;
  if (existingGrade != null) {
    return {
      grade: existingGrade,
      prefillStatus: 'none',
    };
  }

  const policy = PrefillPolicyMapper[questionType];

  if (
    answer?.explanation?.correct === true &&
    policy?.isFullCreditPrefillable(answer)
  ) {
    return {
      grade: maxGrade,
      prefillStatus: 'full',
    };
  }

  if (
    answer?.explanation?.correct === false &&
    policy?.isZeroCreditPrefillable
  ) {
    return {
      grade: 0,
      prefillStatus: 'zero',
    };
  }

  return { grade: null, prefillStatus: 'none' };
};

/**
 * Extracts grades from `payload.answers` and pre-fills them where applicable based on each
 * question type's prefill policy:
 * - maximum grade for correct answers (where the policy allows full-credit prefill)
 * - 0 for incorrect answers (where the policy allows zero-credit prefill)
 * Answers that have already been graded are left unchanged.
 * "Correct" and "incorrect" follows the definition of `explanation.correct` from the server.
 *
 * @param {{ questions: Object[], answers: Answer[] }} payload
 * @returns {Record<number, Object>}
 */
const extractPrefillableGrades = (payload) => {
  const mapQuestionIdToQuestion = arrayToObjectWithKey(payload.questions, 'id');

  return payload.answers.reduce((draft, answer) => {
    const { questionId, grading } = answer;
    const question = mapQuestionIdToQuestion[questionId];
    const { grade, prefillStatus } = getPrefillResult(
      answer,
      question.type,
      question.maximumGrade,
    );
    draft[questionId] = {
      ...grading,
      originalGrade: grading.grade,
      grade,
      prefillStatus,
      // for backwards compatibility, to be removed after prefillStatus is fully adopted
      prefilled: prefillStatus !== 'none',
    };

    return draft;
  }, {});
};

/**
 * Grading reducer. Manages per-question grades, EXP, and base points for a submission.
 *
 * @param {typeof initialState} state
 * @param {{ type: string, [key: string]: any }} action
 * @returns {typeof initialState}
 */
export default function (state = initialState, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS: {
      const { expMultiplier } = state;
      const submission = action.payload.submission;
      const { submittedAt, bonusEndAt, bonusPoints } = submission;

      const basePoints = submission.basePoints;
      const bonusAwarded =
        new Date(submittedAt) < new Date(bonusEndAt) ? bonusPoints : 0;
      const questionWithGrades = extractPrefillableGrades(action.payload);
      const maxGrade = sum(
        Object.values(action.payload.questions).map((q) => q.maximumGrade),
      );

      return {
        ...state,
        questions: questionWithGrades,
        exp:
          action.payload.submission.pointsAwarded ??
          computeExp(
            questionWithGrades,
            maxGrade,
            basePoints,
            expMultiplier,
            bonusAwarded,
          ),
        basePoints,
        maximumGrade: maxGrade,
      };
    }
    case actions.SAVE_GRADE_SUCCESS: {
      const basePoints = action.payload.submission.basePoints;
      const questionWithGrades = extractGrades(action.payload.answers);
      const maxGrade = sum(
        Object.values(action.payload.questions).map((q) => q.maximumGrade),
      );

      const questionIds = Object.keys(questionWithGrades);

      const gradeToBeUpdated =
        questionIds.length !== 1 ||
        (!state.questions[questionIds[0]].grade &&
          !questionWithGrades[questionIds[0]].grade) ||
        state.questions[questionIds[0]].grade.toString() ===
          questionWithGrades[questionIds[0]].grade.toString();

      return gradeToBeUpdated
        ? produce(state, (draftState) => {
            const tempDraftState = draftState;

            Object.keys(questionWithGrades).forEach((id) => {
              tempDraftState.questions[id] = questionWithGrades[id];
            });

            tempDraftState.exp = action.payload.submission.pointsAwarded;
            tempDraftState.basePoints = basePoints;
            tempDraftState.maximumGrade = maxGrade;
          })
        : state;
    }
    case actions.FINALISE_SUCCESS:
    case actions.UNSUBMIT_SUCCESS:
    case actions.SAVE_ALL_GRADE_SUCCESS:
    case actions.MARK_SUCCESS:
    case actions.UNMARK_SUCCESS:
    case actions.PUBLISH_SUCCESS: {
      const basePoints = action.payload.submission.basePoints;
      const questionWithGrades = extractGrades(action.payload.answers);
      const maxGrade = sum(
        Object.values(action.payload.questions).map((q) => q.maximumGrade),
      );

      return produce(state, (draftState) => {
        draftState.questions = questionWithGrades;
        draftState.exp = action.payload.submission.pointsAwarded;
        draftState.basePoints = basePoints;
        draftState.maximumGrade = maxGrade;
      });
    }
    case actions.UPDATE_GRADING: {
      const { maximumGrade, basePoints, expMultiplier } = state;
      const bonusAwarded = action.bonusAwarded;
      const questions = {
        ...state.questions,
        [action.id]: {
          ...state.questions[action.id],
          grade: action.grade,
          prefilled: false,
          prefillStatus: 'none',
        },
      };

      return {
        ...state,
        questions,
        exp: computeExp(
          questions,
          maximumGrade,
          basePoints,
          expMultiplier,
          bonusAwarded,
        ),
      };
    }
    case actions.UPDATE_EXP: {
      return {
        ...state,
        exp: action.exp,
      };
    }
    case actions.UPDATE_MULTIPLIER: {
      const { questions, maximumGrade, basePoints } = state;
      const bonusAwarded = action.bonusAwarded;
      return {
        ...state,
        exp: computeExp(
          questions,
          maximumGrade,
          basePoints,
          action.multiplier,
          bonusAwarded,
        ),
        expMultiplier: action.multiplier,
      };
    }
    case actions.AUTOGRADE_SUCCESS: {
      const { grading, questionId } = action.payload;
      const { maximumGrade, basePoints, expMultiplier } = state;
      if (grading) {
        const questions = {
          ...state.questions,
          [questionId]: {
            ...state.questions[questionId],
            grade: grading.grade,
          },
        };

        return {
          ...state,
          questions,
          exp: computeExp(questions, maximumGrade, basePoints, expMultiplier),
        };
      }
      return state;
    }
    case actions.AUTOGRADE_RUBRIC_SUCCESS: {
      const { grading, questionId } = action.payload;
      if (grading) {
        return produce(state, (draftState) => {
          draftState.questions[questionId].originalGrade = grading.grade;
        });
      }
      return state;
    }
    default:
      return state;
  }
}
