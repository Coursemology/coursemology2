import actionTypes from '../constants';

const initialState = {
  visible: false,
  confirmationDialogOpen: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case actionTypes.ASSESSMENT_FORM_SHOW: {
      return { ...state, visible: true };
    }
    case actionTypes.ASSESSMENT_FORM_CANCEL: {
      return { ...state, confirmationDialogOpen: true };
    }
    case actionTypes.ASSESSMENT_FORM_CONFIRM_CANCEL: {
      return { ...state, confirmationDialogOpen: false };
    }
    case actionTypes.ASSESSMENT_FORM_CONFIRM_DISCARD: {
      return { ...state, confirmationDialogOpen: false, visible: false };
    }
    case actionTypes.CREATE_ASSESSMENT_REQUEST: {
      return { ...state, disabled: true };
    }
    case actionTypes.CREATE_ASSESSMENT_SUCCESS: {
      return {
        ...state,
        visible: false,
        disabled: false,
      };
    }
    case actionTypes.CREATE_ASSESSMENT_FAILURE: {
      return { ...state, disabled: false };
    }
    default:
      return state;
  }
}
