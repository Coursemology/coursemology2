import actions from '../constants';

const initialState = {
  questions: {},
  expMultiplier: 1,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS:
    case actions.SAVE_DRAFT_SUCCESS:
    case actions.SUBMISSION_SUCCESS:
    case actions.UNSUBMIT_SUCCESS:
    case actions.MARK_SUCCESS:
    case actions.PUBLISH_SUCCESS: {
      return {
        ...state,
        questions: {
          ...action.payload.answers.reduce((obj, answer) =>
            ({ ...obj, [answer.questionId]: answer.grading })
          , {}),
        },
      };
    }
    case actions.UPDATE_GRADING: {
      const newQuestionGrades = state.questions;
      newQuestionGrades[action.id].grade = action.grade;
      return {
        ...state,
        questions: newQuestionGrades,
      };
    }
    case actions.UPDATE_EXP: {
      return {
        ...state,
        exp: action.exp,
      };
    }
    case actions.UPDATE_MULTIPLIER:
      return {
        ...state,
        exp: action.exp,
        expMultiplier: action.multiplier,
      };
    default:
      return state;
  }
}
