import actionTypes from '../constants';
import { sortResponseElements } from '../utils';

const initialState = {
  isLoading: false,
  isUnsubmitting: false,
  canUnsubmit: false,
  isResponseCreator: false,
  response: {},
};

export default function (state = initialState, action) {
  const { type } = action;
  switch (type) {
    case actionTypes.CREATE_RESPONSE_REQUEST:
    case actionTypes.LOAD_RESPONSE_REQUEST: {
      return { ...state, isLoading: true };
    }
    case actionTypes.UPDATE_RESPONSE_SUCCESS:
    case actionTypes.CREATE_RESPONSE_SUCCESS:
    case actionTypes.LOAD_RESPONSE_SUCCESS: {
      return {
        ...state,
        response: sortResponseElements(action.response),
        canUnsubmit: action.canUnsubmit,
        isResponseCreator: action.isResponseCreator,
        isLoading: false,
      };
    }
    case actionTypes.CREATE_RESPONSE_FAILURE:
    case actionTypes.LOAD_RESPONSE_FAILURE: {
      return { ...state, isLoading: false };
    }
    case actionTypes.UNSUBMIT_RESPONSE_REQUEST: {
      return { ...state, isUnsubmitting: true };
    }
    case actionTypes.UNSUBMIT_RESPONSE_SUCCESS: {
      return {
        ...state,
        response: sortResponseElements(action.response),
        isUnsubmitting: false,
      };
    }
    case actionTypes.UNSUBMIT_RESPONSE_FAILURE: {
      return { ...state, isUnsubmitting: false };
    }
    default:
      return state;
  }
}
