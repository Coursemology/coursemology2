import actions from '../constants';

export default function (state = {}, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS:
    case actions.SAVE_DRAFT_SUCCESS:
    case actions.SUBMISSION_SUCCESS:
    case actions.UNSUBMIT_SUCCESS:
    case actions.SAVE_GRADE_SUCCESS:
    case actions.MARK_SUCCESS:
    case actions.UNMARK_SUCCESS:
    case actions.PUBLISH_SUCCESS:
      return {
        ...state,
        ...action.payload.answers.reduce((obj, answer) =>
          ({ ...obj, [answer.questionId]: answer.testCases })
        , {}),
      };
    case actions.AUTOGRADE_SUCCESS:
    case actions.RESET_SUCCESS: {
      const { questionId } = action.payload;
      return Object.keys(state).reduce((obj, key) => {
        if (key !== questionId.toString()) {
          return { ...obj, [key]: state[key] };
        }
        return obj;
      }, { [questionId]: action.payload.testCases });
    }
    default:
      return state;
  }
}
