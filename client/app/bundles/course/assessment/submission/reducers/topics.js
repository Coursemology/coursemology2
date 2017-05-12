import actions from '../constants';
import arrayToObjectById from './utils';

export default function (state = {}, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS: {
      return {
        ...state,
        ...arrayToObjectById(action.payload.topics),
      };
    }
    default:
      return state;
  }
}
