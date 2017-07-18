import actionTypes from '../constants';

export default function (state = {}, action) {
  switch (action.type) {
    case actionTypes.SET_NOTIFICATION:
      return { message: action.message };
    default:
      return state;
  }
}
