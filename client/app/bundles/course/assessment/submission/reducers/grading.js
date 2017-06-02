import actions from '../constants';

export default function (state = {}, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS:
    case actions.SAVE_DRAFT_SUCCESS:
    case actions.SUBMISSION_SUCCESS:
    case actions.UNSUBMIT_SUCCESS: {
      const grading = {};
      const questions = action.payload.questions;
      Object.values(questions).forEach((question) => { grading[question.id] = 0; });
      return { ...grading };
    }
    case actions.UPDATE_GRADING: {
      const newState = { ...state };
      newState[action.id] = action.grade;
      return newState;
    }
    default:
      return state;
  }
}
