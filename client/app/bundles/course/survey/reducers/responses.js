import actionTypes from '../constants';

const initialState = {
  isLoading: false,
  responses: [],
};

export default function (state = initialState, action) {
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
    default:
      return state;
  }
}
