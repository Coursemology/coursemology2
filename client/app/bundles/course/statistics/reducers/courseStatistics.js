import actionTypes from '../constants';

const initialState = {
  isFetchingProgression: false,
  isFetchingPerformance: false,
  isErrorProgression: false,
  isErrorPerformance: false,
  assessments: [],
  submissions: [],
  students: [],
  hasPersonalizedTimeline: false,
  isCourseGamified: false,
  showVideo: false,
  courseVideoCount: 0,
  notification: {}, // Centralised notification shape across all the different reducers
};

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.FETCH_COURSE_PROGRESSION_STATISTICS_REQUEST: {
      return { ...state, isFetchingProgression: true };
    }
    case actionTypes.FETCH_COURSE_PERFORMANCE_STATISTICS_REQUEST: {
      return { ...state, isFetchingPerformance: true };
    }
    case actionTypes.FETCH_COURSE_PROGRESSION_STATISTICS_SUCCESS: {
      return {
        ...state,
        isFetchingProgression: false,
        assessments: action.assessments,
        submissions: action.submissions,
      };
    }
    case actionTypes.FETCH_COURSE_PERFORMANCE_STATISTICS_SUCCESS: {
      return {
        ...state,
        isFetchingPerformance: false,
        students: action.students,
        hasPersonalizedTimeline: action.hasPersonalizedTimeline,
        isCourseGamified: action.isCourseGamified,
        showVideo: action.showVideo,
        courseVideoCount: action.courseVideoCount,
      };
    }
    case actionTypes.FETCH_COURSE_PROGRESSION_STATISTICS_FAILURE: {
      return {
        ...state,
        isFetchingProgression: false,
        isErrorProgression: true,
        notification: { message: action.message },
      };
    }
    case actionTypes.FETCH_COURSE_PERFORMANCE_STATISTICS_FAILURE: {
      return {
        ...state,
        isFetchingPerformance: false,
        isErrorPerformance: true,
        notification: { message: action.message },
      };
    }
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
