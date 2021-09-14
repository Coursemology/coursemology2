import actionTypes from '../constants';

const initialState = {
  disabled: false,
  notification: null,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case actionTypes.UPDATE_ACHIEVEMENT_REQUEST: {
      return { ...state, disabled: true };
    }
    case actionTypes.UPDATE_ACHIEVEMENT_SUCCESS: {
      return {
        ...state,
        disabled: false,
        notification: { message: action.message },
      };
    }
    case actionTypes.UPDATE_ACHIEVEMENT_FAILURE: {
      return {
        ...state,
        disabled: false,
        notification: { message: action.message },
      };
    }
    default:
      return state;
  }
}
