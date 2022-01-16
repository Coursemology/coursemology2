import actionTypes from '../constants';

const initialState = {
  isCreateDialogShown: false,
  isUpdateDialogShown: false,
  isCreateConfirmationDialogOpen: false,
  isUpdateConfirmationDialogOpen: false,
  isDisabled: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case actionTypes.CREATE_CATEGORY_FORM_SHOW: {
      return { ...state, isCreateDialogShown: true };
    }
    case actionTypes.UPDATE_CATEGORY_FORM_SHOW: {
      return { ...state, isUpdateDialogShown: true };
    }
    case actionTypes.CREATE_CATEGORY_FORM_CANCEL: {
      if (action.payload.isPristine) {
        return { ...state, isCreateDialogShown: false };
      }
      return { ...state, isCreateConfirmationDialogOpen: true };
    }
    case actionTypes.UPDATE_CATEGORY_FORM_CANCEL: {
      if (action.payload.isPristine) {
        return { ...state, isUpdateDialogShown: false };
      }
      return { ...state, isUpdateConfirmationDialogOpen: true };
    }
    case actionTypes.CREATE_CATEGORY_FORM_CONFIRM_CANCEL: {
      return { ...state, isCreateConfirmationDialogOpen: false };
    }
    case actionTypes.UPDATE_CATEGORY_FORM_CONFIRM_CANCEL: {
      return { ...state, isUpdateConfirmationDialogOpen: false };
    }
    case actionTypes.CREATE_CATEGORY_FORM_CONFIRM_DISCARD: {
      return {
        ...state,
        isCreateConfirmationDialogOpen: false,
        isCreateDialogShown: false,
      };
    }
    case actionTypes.UPDATE_CATEGORY_FORM_CONFIRM_DISCARD: {
      return {
        ...state,
        isUpdateConfirmationDialogOpen: false,
        isUpdateDialogShown: false,
      };
    }
    case actionTypes.CREATE_CATEGORY_REQUEST:
    case actionTypes.UPDATE_CATEGORY_REQUEST: {
      return { ...state, isDisabled: true };
    }
    case actionTypes.CREATE_CATEGORY_SUCCESS: {
      return {
        ...state,
        isCreateDialogShown: false,
        isDisabled: false,
      };
    }
    case actionTypes.UPDATE_CATEGORY_SUCCESS: {
      return {
        ...state,
        isUpdateDialogShown: false,
        isDisabled: false,
      };
    }
    case actionTypes.UPDATE_CATEGORY_FAILURE: {
      return {
        ...state,
        isDisabled: false,
      };
    }
    default:
      return state;
  }
}
