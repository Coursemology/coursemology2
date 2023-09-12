import actions, { questionTypes } from '../constants';

const initialState = {
  questions: {},
  expMultiplier: 1,
};

const sum = (array) => array.filter((i) => i).reduce((acc, i) => acc + i, 0);

const computeExp = (
  questions,
  maximumGrade,
  basePoints,
  expMultiplier,
  bonusAwarded = 0,
) => {
  const totalGrade = sum(Object.values(questions).map((q) => q.grade));
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

/**
 * Extracts grades from `payload.answer`, and pre-fills the maximum grade for correct
 * answers that have not been graded. "Correct" follows the definition of
 * `explanation.correct` from the server.
 */
const extractPrefillableGrades = (payload) => {
  const maxGrades = payload.questions.reduce((draft, question) => {
    draft[question.id] = question.maximumGrade;
    return draft;
  }, {});

  const mapQuestionIdToQuestionType = payload.questions.reduce(
    (draft, question) => {
      draft[question.id] = question.type;
      return draft;
    },
    {},
  );

  /**
   * numTestCases: should the testCases be defined, we return the number
   * of testCases over there (public, private, and evaluation). Otherwise,
   * return 0
   */
  const numTestCases = (testCases) => {
    if (!testCases) {
      return 0;
    }

    const numPublicTestCases = testCases.public_test?.length ?? 0;
    const numPrivateTestCases = testCases.private_test?.length ?? 0;
    const numEvaluationTestCases = testCases.evaluation_test?.length ?? 0;

    return numPublicTestCases + numPrivateTestCases + numEvaluationTestCases;
  };

  /**
   * isPrefillableByType: A function to decide whether a certain answer is
   * prefillable based on its question type. The criteria based on type
   * shall be either MultipleChoice, MultipleResponse, or Programming
   *
   * If the question type is Programming, there's an additional criteria
   * in which there should be at least one test cases present
   */
  const isPrefillableByType = (questionId, testCases) => {
    const questionType = mapQuestionIdToQuestionType[questionId];
    if (
      questionType === questionTypes.MultipleChoice ||
      questionType === questionTypes.MultipleResponse
    ) {
      return true;
    }

    if (
      questionType === questionTypes.Programming &&
      numTestCases(testCases) > 0
    ) {
      return true;
    }

    return false;
  };

  return payload.answers.reduce(
    (draft, { questionId, grading, explanation, testCases }) => {
      const prefillable =
        grading.grade === null &&
        explanation?.correct &&
        isPrefillableByType(questionId, testCases);

      draft[questionId] = {
        ...grading,
        originalGrade: grading.grade,
        grade: prefillable ? maxGrades[questionId] : grading.grade,
        prefilled: prefillable,
      };

      return draft;
    },
    {},
  );
};

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS:
    case actions.SAVE_DRAFT_SUCCESS:
    case actions.FINALISE_SUCCESS:
    case actions.UNSUBMIT_SUCCESS:
    case actions.SAVE_GRADE_SUCCESS:
    case actions.MARK_SUCCESS:
    case actions.UNMARK_SUCCESS:
    case actions.PUBLISH_SUCCESS: {
      return {
        ...state,
        questions:
          action.type === actions.FETCH_SUBMISSION_SUCCESS
            ? extractPrefillableGrades(action.payload)
            : extractGrades(action.payload.answers),
        exp: action.payload.submission.pointsAwarded,
        basePoints: action.payload.submission.basePoints,
        maximumGrade: sum(
          Object.values(action.payload.questions).map((q) => q.maximumGrade),
        ),
      };
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
      const { grading } = action.payload;
      const { maximumGrade, basePoints, expMultiplier } = state;
      if (grading) {
        const questions = {
          ...state.questions,
          [action.questionId]: {
            ...state.questions[action.questionId],
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
    default:
      return state;
  }
}
