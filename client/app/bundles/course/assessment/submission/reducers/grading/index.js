/* eslint-disable no-param-reassign */
import { produce } from 'immer';
import { arrayToObjectWithKey } from 'utilities/array';

import actions, { questionTypes } from '../../constants';

const initialState = {
  questions: {},
  expMultiplier: 1,
  exp: 0,
  basePoints: 0,
  maximumGrade: 0,
};

const sum = (array) => array.filter((i) => i).reduce((acc, i) => acc + i, 0);

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

const extractGrades = (answers) =>
  answers.reduce((draft, { questionId, grading }) => {
    draft[questionId] = {
      ...grading,
      originalGrade: grading.grade,
    };

    return draft;
  }, {});

const NEVER_PREFILL_POLICY = {
  canPrefillFullCredit: () => false,
  canPrefillZeroCredit: false,
};

const ALWAYS_PREFILL_POLICY = {
  canPrefillFullCredit: () => true,
  canPrefillZeroCredit: true,
};

const ONLY_PREFILL_FULL_POLICY = {
  canPrefillFullCredit: () => true,
  canPrefillZeroCredit: false,
};

const PROGRAMMING_PREFILL_POLICY = {
  canPrefillFullCredit: ({ testCases }) =>
    (testCases?.public_test?.length ?? 0) > 0 ||
    (testCases?.private_test?.length ?? 0) > 0 ||
    (testCases?.evaluation_test?.length ?? 0) > 0,

  // Partial grading is possible
  canPrefillZeroCredit: false,
};

const prefillPolicies = {
  [questionTypes.MultipleChoice]: ALWAYS_PREFILL_POLICY,
  [questionTypes.MultipleResponse]: ALWAYS_PREFILL_POLICY,

  [questionTypes.Programming]: PROGRAMMING_PREFILL_POLICY,

  [questionTypes.TextResponse]: ONLY_PREFILL_FULL_POLICY,
  [questionTypes.Comprehension]: ONLY_PREFILL_FULL_POLICY,

  [questionTypes.RubricBasedResponse]: NEVER_PREFILL_POLICY,
  [questionTypes.FileUpload]: NEVER_PREFILL_POLICY,
  [questionTypes.Scribing]: NEVER_PREFILL_POLICY,
  [questionTypes.VoiceResponse]: NEVER_PREFILL_POLICY,
  [questionTypes.ForumPostResponse]: NEVER_PREFILL_POLICY,
};

const getPrefilledGrade = (answer, questionType, maxGrade) => {
  const existingGrade = answer?.grading?.grade;
  if (existingGrade != null) return existingGrade;

  const policy = prefillPolicies[questionType];

  if (
    answer?.explanation?.correct === true &&
    policy?.canPrefillFullCredit(answer)
  ) {
    return maxGrade;
  }

  if (answer?.explanation?.correct === false && policy?.canPrefillZeroCredit) {
    return 0;
  }

  return null;
};

/**
 * Extracts grades from `payload.answer` and pre-fills:
 * - maximum grade for correct answers
 * - 0 for incorrect answers
 * when they have not already been graded.
 * "Correct" and "incorrect" follows the definition of `explanation.correct` from the server.
 */
const extractPrefillableGrades = (payload) => {
  const mapQuestionIdToQuestion = arrayToObjectWithKey(payload.questions, 'id');

  return payload.answers.reduce((draft, answer) => {
    const { questionId, grading } = answer;
    const prefilledGrade = getPrefilledGrade(
      answer,
      mapQuestionIdToQuestion[questionId].type,
      mapQuestionIdToQuestion[questionId].maximumGrade,
    );
    draft[questionId] = {
      ...grading,
      originalGrade: grading.grade,
      grade: prefilledGrade,
      prefilled: grading.grade == null && prefilledGrade !== null,
    };

    return draft;
  }, {});
};

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
          autofilled: false,
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
