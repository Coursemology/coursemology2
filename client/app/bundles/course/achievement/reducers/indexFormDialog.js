import actionTypes from '../constants';

const initialState = {
  visible: false,
  confirmationDialogOpen: false,
  disabled: false,
  notification: null,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case actionTypes.ACHIEVEMENT_FORM_SHOW: {
      return { ...state, visible: true };
    }
    case actionTypes.ACHIEVEMENT_FORM_CANCEL: {
      if (action.payload.pristine) {
        return { ...state, visible: false };
      }

      return { ...state, confirmationDialogOpen: true };
    }
    case actionTypes.ACHIEVEMENT_FORM_CONFIRM_CANCEL: {
      return { ...state, confirmationDialogOpen: false };
    }
    case actionTypes.ACHIEVEMENT_FORM_CONFIRM_DISCARD: {
      return { ...state, confirmationDialogOpen: false, visible: false };
    }
    case actionTypes.CREATE_ACHIEVEMENT_REQUEST: {
      return { ...state, disabled: true };
    }
    case actionTypes.CREATE_ACHIEVEMENT_SUCCESS: {
      return {
        ...state,
        visible: false,
        disabled: false,
        notification: { message: action.message },
      };
    }
    case actionTypes.CREATE_ACHIEVEMENT_FAILURE: {
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
