import actionTypes from '../constants';
import { sortResponseElements } from '../utils';

const initialState = {
  isLoading: false,
  survey: {},
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
        survey: action.survey,
        response: sortResponseElements(action.response),
        isLoading: false,
      };
    }
    case actionTypes.CREATE_RESPONSE_FAILURE:
    case actionTypes.LOAD_RESPONSE_FAILURE: {
      return { ...state, isLoading: false };
    }
    default:
      return state;
  }
}
