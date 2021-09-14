import { updateOrAppend } from 'lib/helpers/reducer-helpers';
import actionTypes from '../constants';

const initialState = {
  isLoading: false,
  responses: [],
};

export default function(state = initialState, action) {
  const { type } = action;
  switch (type) {
    case actionTypes.LOAD_RESPONSES_REQUEST: {
      return { ...state, isLoading: true };
    }
    case actionTypes.LOAD_RESPONSES_SUCCESS: {
      return {
        responses: action.responses,
        isLoading: false,
      };
    }
    case actionTypes.LOAD_RESPONSES_FAILURE: {
      return { ...state, isLoading: false };
    }
    case actionTypes.UNSUBMIT_RESPONSE_SUCCESS: {
      const { canUnsubmit } = action.flags;
      const response = { ...action.response, canUnsubmit };
      const responses = updateOrAppend(state.responses, response);
      return { ...state, responses };
    }
    default:
      return state;
  }
}
