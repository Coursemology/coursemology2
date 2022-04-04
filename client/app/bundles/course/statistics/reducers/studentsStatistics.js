import actionTypes from '../constants';

const initialState = {
  isFetching: false,
  isError: false,
  students: [],
  isCourseGamified: false,
  hasGroupManagers: false,
  showVideo: false,
  courseVideoCount: 0,
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
        isCourseGamified: action.isCourseGamified,
        showVideo: action.showVideo,
        courseVideoCount: action.courseVideoCount,
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
