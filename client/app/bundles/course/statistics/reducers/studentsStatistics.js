import actionTypes from '../constants';

const initialState = {
  isFetching: false,
  isError: false,
  students: [],
  assessments: [],
  isCourseGamified: false,
  hasGroupManagers: false,
};

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.FETCH_STUDENTS_STATISTICS_REQUEST: {
      return { ...state, isFetching: true };
    }
    case actionTypes.FETCH_STUDENTS_STATISTICS_SUCCESS: {
      return {
        ...state,
        isFetching: false,
        students: action.students,
        assessments: action.assessments,
        isCourseGamified: action.isCourseGamified,
        hasGroupManagers: action.hasGroupManagers,
      };
    }
    case actionTypes.FETCH_STUDENTS_STATISTICS_FAILURE: {
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
