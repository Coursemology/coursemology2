import actions from '../constants';

const initialState = {
  questions: {},
  expMultiplier: 1,
};

function sum(array) {
  return array.filter(i => i).reduce((acc, i) => acc + i, 0);
}

function computeExp(questions, maximumGrade, basePoints, expMultiplier) {
  const totalGrade = sum(Object.values(questions).map(q => q.grade));
  return Math.round((totalGrade / maximumGrade) * basePoints * expMultiplier);
}

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
        questions: {
          ...action.payload.answers.reduce((obj, answer) => ({ ...obj, [answer.questionId]: answer.grading }),
            {}),
        },
        exp: action.payload.submission.pointsAwarded,
        basePoints: action.payload.submission.basePoints,
        maximumGrade: sum(Object.values(action.payload.questions).map(q => q.maximumGrade)),
      };
    }
    case actions.UPDATE_GRADING: {
      const { maximumGrade, basePoints, expMultiplier } = state;
      const questions = {
        ...state.questions,
        [action.id]: { ...state.questions[action.id], grade: action.grade },
      };

      return {
        ...state,
        questions,
        exp: computeExp(questions, maximumGrade, basePoints, expMultiplier),
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

      return {
        ...state,
        exp: computeExp(questions, maximumGrade, basePoints, action.multiplier),
        expMultiplier: action.multiplier,
      };
    }
    default:
      return state;
  }
}
