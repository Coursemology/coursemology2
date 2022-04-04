import actionTypes from '../constants';

const initialState = {
  isLoading: false,
  isError: false,
  learningRateRecords: [],
  notification: {},
};

export default function (state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_USER_STATISTICS_REQUEST:
      return { ...state, isLoading: true };
    case actionTypes.LOAD_USER_STATISTICS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        learningRateRecords: action.learningRateRecords,
      };
    case actionTypes.LOAD_USER_STATISTICS_FAILURE:
      return {
        ...state,
        isLoading: true,
        isError: true,
        notification: { message: action.message },
      };
    default:
      return state;
  }
}
