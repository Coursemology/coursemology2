import actionTypes from '../constants';

const initialState = {
  notification: {}, // Centralised notification shape across all the different reducers
};

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    // Catch all other failure cases from other reducers
    case actionTypes.FETCH_STAFF_STATISTICS_FAILURE:
    case actionTypes.FETCH_STUDENTS_STATISTICS_FAILURE: {
      return {
        ...state,
        notification: { message: action.message },
      };
    }
    default:
      return state;
  }
}
