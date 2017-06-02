import actions from '../constants';
import { arrayToObjectById } from '../utils';

export default function (state = {}, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS:
    case actions.SAVE_DRAFT_SUCCESS:
    case actions.SUBMISSION_SUCCESS:
    case actions.UNSUBMIT_SUCCESS:
    case actions.MARK_SUCCESS:
    case actions.PUBLISH_SUCCESS:
      return {
        ...state,
        ...arrayToObjectById(action.payload.questions),
      };
    case actions.AUTOGRADE_SUCCESS: {
      const { questionId } = action.payload.answers[0];
      return {
        ...state,
        [questionId]: {
          ...state[questionId],
          answerId: action.payload.answers[0].id,
        },
      };
    }
    default:
      return state;
  }
}
