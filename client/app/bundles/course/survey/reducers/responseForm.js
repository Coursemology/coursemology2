import actionTypes from '../constants';
import { sortResponseElements } from '../utils';

const initialState = {
  response: {},
  flags: {
    isLoading: false,
    isSubmitting: false,
    canModify: false,
    canSubmit: false,
    canUnsubmit: false,
    isResponseCreator: false,
  },
};

export default function (state = initialState, action) {
  const { type } = action;
  switch (type) {
    case actionTypes.CREATE_RESPONSE_REQUEST:
    case actionTypes.LOAD_RESPONSE_EDIT_REQUEST:
    case actionTypes.LOAD_RESPONSE_REQUEST: {
      return { ...state, flags: { ...state.flags, isLoading: true } };
    }
    case actionTypes.UPDATE_RESPONSE_REQUEST: {
      return { ...state, flags: { ...state.flags, isSubmitting: true } };
    }
    case actionTypes.UPDATE_RESPONSE_SUCCESS:
    case actionTypes.CREATE_RESPONSE_SUCCESS:
    case actionTypes.LOAD_RESPONSE_EDIT_SUCCESS:
    case actionTypes.LOAD_RESPONSE_SUCCESS: {
      return {
        ...state,
        response: sortResponseElements(action.response),
        flags: { ...state.flags, ...action.flags, isLoading: false, isSubmitting: false },
      };
    }
    case actionTypes.CREATE_RESPONSE_FAILURE:
    case actionTypes.LOAD_RESPONSE_EDIT_FAILURE:
    case actionTypes.LOAD_RESPONSE_FAILURE: {
      return { ...state, flags: { ...state.flags, isLoading: false } };
    }
    case actionTypes.UPDATE_RESPONSE_FAILURE: {
      return { ...state, flags: { ...state.flags, isSubmitting: false } };
    }
    case actionTypes.UNSUBMIT_RESPONSE_SUCCESS: {
      return {
        ...state,
        response: sortResponseElements(action.response),
        flags: { ...state.flags, ...action.flags },
      };
    }
    default:
      return state;
  }
}
