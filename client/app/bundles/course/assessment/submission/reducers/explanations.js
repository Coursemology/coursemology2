import actions from '../constants';
import { arrayToObjectById } from '../utils';

export default function (state = {}, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS:
    case actions.SAVE_DRAFT_SUCCESS:
    case actions.SUBMISSION_SUCCESS:
    case actions.UNSUBMIT_SUCCESS:
      return {
        ...state,
        ...arrayToObjectById(action.payload.explanations),
      };
    case actions.AUTOGRADE_SUCCESS: {
      if (action.payload.explanations === undefined) return state;

      const { questionId, id } = action.payload.explanations[0];
      return Object.keys(state).reduce((obj, key) => {
        if (state[key].questionId !== questionId) {
          return { ...obj, [key]: state[key] };
        }
        return obj;
      }, { [id]: action.payload.explanations[0] });
    }
    default:
      return state;
  }
}
