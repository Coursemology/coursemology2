import actionTypes from '../constants';

export default function (state = {}, action) {
  if (String(state.id) !== String(action.milestoneId)) {
    return state;
  }

  switch (action.type) {
    case actionTypes.MILESTONE_UPDATE_SUCCESS: {
      return { ...state, ...action.values };
    }
    default:
      return state;
  }
}
