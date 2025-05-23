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

const isSpecificAnswerGradePrefillableMap = {
  [questionTypes.MultipleChoice]: () => true,
  [questionTypes.MultipleResponse]: () => true,
  [questionTypes.Programming]: (answer) => {
    const { testCases } = answer;
    const isPublicTestCasesExist = testCases?.public_test?.length > 0;
    const isPrivateTestCasesExist = testCases?.private_test?.length > 0;
    const isEvaluationTestCasesExist = testCases?.evaluation_test?.length > 0;
    return (
      isPublicTestCasesExist ||
      isPrivateTestCasesExist ||
      isEvaluationTestCasesExist
    );
  },
  [questionTypes.RubricBasedResponse]: () => false,
  [questionTypes.TextResponse]: () => false,
  [questionTypes.Comprehension]: () => false,
  [questionTypes.FileUpload]: () => false,
  [questionTypes.Scribing]: () => false,
  [questionTypes.VoiceResponse]: () => false,
  [questionTypes.ForumPostResponse]: () => false,
};

const isAnswerGradePrefillable = (answer, questionType) => {
  const isAnswerPrefillable =
    answer.grading.grade === null && answer.explanation?.correct;
  const isSpecificAnswerPrefillable =
    isSpecificAnswerGradePrefillableMap[questionType](answer);
  return isAnswerPrefillable && isSpecificAnswerPrefillable;
};

/**
 * Extracts grades from `payload.answer`, and pre-fills the maximum grade for correct
 * answers that have not been graded. "Correct" follows the definition of
 * `explanation.correct` from the server.
 */
const extractPrefillableGrades = (payload) => {
  const mapQuestionIdToQuestion = arrayToObjectWithKey(payload.questions, 'id');

  return payload.answers.reduce((draft, answer) => {
    const { questionId, grading } = answer;
    const prefillable = isAnswerGradePrefillable(
      answer,
      mapQuestionIdToQuestion[questionId].type,
    );
    draft[questionId] = {
      ...grading,
      originalGrade: grading.grade,
      grade: prefillable
        ? mapQuestionIdToQuestion[questionId].maximumGrade
        : grading.grade,
      prefilled: prefillable,
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
