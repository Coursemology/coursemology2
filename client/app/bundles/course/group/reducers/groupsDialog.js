import actionTypes, { dialogTypes } from '../constants';

const initialState = {
  isShown: false,
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
      return { ...state, isShown: false };
    }
    case actionTypes.SET_IS_DISABLED_TRUE:
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
    case actionTypes.SET_IS_DISABLED_FALSE:
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
