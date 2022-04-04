import actionTypes from '../constants';

const initialState = {
  isFetching: false,
  isError: false,
  staff: [],
};

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.FETCH_STAFF_STATISTICS_REQUEST: {
      return { ...state, isFetching: true };
    }
    case actionTypes.FETCH_STAFF_STATISTICS_SUCCESS: {
      return {
        ...state,
        isFetching: false,
        staff: action.staff,
      };
    }
    case actionTypes.FETCH_STAFF_STATISTICS_FAILURE: {
      return {
        ...state,
        isFetching: false,
        isError: true,
      };
    }
    default:
      return state;
  }
}
