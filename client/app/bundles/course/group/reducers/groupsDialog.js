import actionTypes from '../constants';

const initialState = {
  isShown: false,
  isConfirmationDialogOpen: false,
  isDisabled: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case actionTypes.CATEGORY_FORM_SHOW: {
      return { ...state, isShown: true };
    }
    case actionTypes.CATEGORY_FORM_CANCEL: {
      if (action.payload.isPristine) {
        return { ...state, isShown: false };
      }
      return { ...state, isConfirmationDialogOpen: true };
    }
    case actionTypes.ASSESSMENT_FORM_CONFIRM_CANCEL: {
      return { ...state, isConfirmationDialogOpen: false };
    }
    case actionTypes.CATEGORY_FORM_CONFIRM_DISCARD: {
      return { ...state, isConfirmationDialogOpen: false, isShown: false };
    }
    case actionTypes.CREATE_CATEGORY_REQUEST: {
      return { ...state, isDisabled: true };
    }
    case actionTypes.CREATE_CATEGORY_SUCCESS: {
      return {
        ...state,
        isShown: false,
        isDisabled: false,
      };
    }
    case actionTypes.CREATE_CATEGORY_FAILURE: {
      return {
        ...state,
        isDisabled: false,
      };
    }
    default:
      return state;
  }
}
