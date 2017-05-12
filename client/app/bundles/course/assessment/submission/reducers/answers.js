import actions from '../constants';
import arrayToObjectById from './utils';

export default function (state = {}, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS:
    case actions.UPDATE_SUBMISSION_SUCCESS:
    case actions.UPDATE_ANSWER_SUCCESS:
      return {
        ...state,
        ...arrayToObjectById(action.payload.answers),
      };
    default:
      return state;
  }
}
