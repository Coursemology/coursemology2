import actions from '../constants';

export default function(state = {}, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS:
    case actions.FETCH_SUBMISSIONS_SUCCESS:
      return action.payload.assessment;
    default:
      return state;
  }
}
