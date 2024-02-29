import actionTypes from '../constants';

const initialState = {
  assessments: [],
  submissions: [],
  isFetchingProgression: false,
  isErrorProgression: false,
};

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.FETCH_COURSE_PROGRESSION_STATISTICS_REQUEST: {
      return { ...state, isFetchingProgression: true };
    }
    case actionTypes.FETCH_COURSE_PROGRESSION_STATISTICS_SUCCESS: {
      return {
        ...state,
        isFetchingProgression: false,
        assessments: action.assessments,
        submissions: action.submissions,
      };
    }
    case actionTypes.FETCH_COURSE_PROGRESSION_STATISTICS_FAILURE: {
      return {
        ...state,
        isFetchingProgression: false,
        isErrorProgression: true,
      };
    }
    // Catch all other failure cases from other reducers
    case actionTypes.FETCH_STAFF_STATISTICS_FAILURE:
    case actionTypes.FETCH_STUDENTS_STATISTICS_FAILURE:
    case actionTypes.FETCH_COURSE_PERFORMANCE_STATISTICS_FAILURE: {
      return { ...state };
    }
    default:
      return state;
  }
}
