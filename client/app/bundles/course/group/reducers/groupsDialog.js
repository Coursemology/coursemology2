import actionTypes, { dialogTypes } from '../constants';

const initialState = {
  isShown: false,
  isConfirmationDialogOpen: false,
  dialogType: dialogTypes.CREATE_CATEGORY,
  isDisabled: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case actionTypes.CREATE_CATEGORY_FORM_SHOW: {
      return {
        ...state,
        isShown: true,
        dialogType: dialogTypes.CREATE_CATEGORY,
      };
    }
    case actionTypes.UPDATE_CATEGORY_FORM_SHOW: {
      return {
        ...state,
        isShown: true,
        dialogType: dialogTypes.UPDATE_CATEGORY,
      };
    }
    case actionTypes.CREATE_GROUP_FORM_SHOW: {
      return {
        ...state,
        isShown: true,
        dialogType: dialogTypes.CREATE_GROUP,
      };
    }
    case actionTypes.UPDATE_GROUP_FORM_SHOW: {
      return {
        ...state,
        isShown: true,
        dialogType: dialogTypes.UPDATE_GROUP,
      };
    }
    case actionTypes.DIALOG_CANCEL: {
      if (action.payload.isPristine) {
        return { ...state, isShown: false };
      }
      return { ...state, isConfirmationDialogOpen: true };
    }
    case actionTypes.DIALOG_CONFIRM_CANCEL: {
      return { ...state, isConfirmationDialogOpen: false };
    }
    case actionTypes.DIALOG_CONFIRM_DISCARD: {
      return {
        ...state,
        isConfirmationDialogOpen: false,
        isShown: false,
      };
    }
    case actionTypes.CREATE_CATEGORY_REQUEST:
    case actionTypes.UPDATE_CATEGORY_REQUEST:
    case actionTypes.CREATE_GROUP_REQUEST:
    case actionTypes.UPDATE_GROUP_REQUEST: {
      return { ...state, isDisabled: true };
    }
    case actionTypes.CREATE_CATEGORY_SUCCESS:
    case actionTypes.UPDATE_CATEGORY_SUCCESS:
    case actionTypes.CREATE_GROUP_SUCCESS:
    case actionTypes.UPDATE_GROUP_SUCCESS: {
      return {
        ...state,
        isShown: false,
        isDisabled: false,
      };
    }
    case actionTypes.CREATE_CATEGORY_FAILURE:
    case actionTypes.UPDATE_CATEGORY_FAILURE:
    case actionTypes.CREATE_GROUP_FAILURE:
    case actionTypes.UPDATE_GROUP_FAILURE: {
      return {
        ...state,
        isDisabled: false,
      };
    }
    default:
      return state;
  }
}
