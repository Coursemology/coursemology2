import { actionTypes } from '../constants';

const initialState = {
  isLoading: false,
};

export default function flagsReducer(state = initialState, action) {
  const { type } = action;
  switch (type) {
    case actionTypes.SUBMIT_FORM_REQUEST:
      return { ...state, isLoading: true };
    case actionTypes.SUBMIT_FORM_SUCCESS:
    case actionTypes.SUBMIT_FORM_FAILURE:
      return { ...state, isLoading: false };
    default:
      return state;
  }
}
