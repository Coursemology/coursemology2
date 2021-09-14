import actionTypes from '../constants';

const initialState = { message: null };

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.SET_NOTIFICATION: {
      return { message: action.message };
    }
    default:
      return state;
  }
}
