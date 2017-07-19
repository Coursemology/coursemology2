import actionTypes from '../constants';

const initialState = {};

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.SET_ADMIN_NOTIFICATION: {
      return { message: action.message };
    }
    default:
      return state;
  }
}
