import actionTypes from '../constants';

const initialState = {
  isShown: false,
  isConfirmationDialogOpen: false,
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
    default:
      return state;
  }
}
