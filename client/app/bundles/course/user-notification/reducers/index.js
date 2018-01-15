import actionTypes from '../constants';

const initialState = {
  popupNotification: {},
  popupOpen: true,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case actionTypes.MARK_AS_READ_REQUEST: {
      return { ...state, popupOpen: false };
    }
    case actionTypes.MARK_AS_READ_SUCCESS: {
      return {
        popupNotification: action.nextNotification,
        popupOpen: !!action.nextNotification,
      };
    }

    default:
      return state;
  }
}
