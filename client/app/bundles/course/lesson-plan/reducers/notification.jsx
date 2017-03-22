import actionTypes from '../constants';

export const initialState = '';

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.SET_SURVEY_NOTIFICATION: {
      return action.message;
    }
    case actionTypes.RESET_SURVEY_NOTIFICATION: {
      return '';
    }
    default:
      return state;
  }
}
