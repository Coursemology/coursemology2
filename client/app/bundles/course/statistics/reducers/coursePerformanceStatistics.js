import actionTypes from '../constants';

const initialState = {
  isFetchingPerformance: false,
  isErrorPerformance: false,
  students: [],
  metadata: {
    hasPersonalizedTimeline: false,
    isCourseGamified: false,
    showVideo: false,
    courseVideoCount: 0,
    courseAssessmentCount: 0,
    courseAchievementCount: 0,
    maxLevel: 0,
    hasGroupManagers: false,
  },
};

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.FETCH_COURSE_PERFORMANCE_STATISTICS_REQUEST: {
      return { ...state, isFetchingPerformance: true };
    }
    case actionTypes.FETCH_COURSE_PERFORMANCE_STATISTICS_SUCCESS: {
      return {
        ...state,
        isFetchingPerformance: false,
        students: action.students,
        metadata: {
          hasPersonalizedTimeline: action.metadata.hasPersonalizedTimeline,
          isCourseGamified: action.metadata.isCourseGamified,
          showVideo: action.metadata.showVideo,
          courseVideoCount: action.metadata.courseVideoCount,
          courseAssessmentCount: action.metadata.courseAssessmentCount,
          courseAchievementCount: action.metadata.courseAchievementCount,
          maxLevel: action.metadata.maxLevel,
          hasGroupManagers: action.metadata.hasGroupManagers,
        },
      };
    }
    case actionTypes.FETCH_COURSE_PERFORMANCE_STATISTICS_FAILURE: {
      return {
        ...state,
        isFetchingPerformance: false,
        isErrorPerformance: true,
      };
    }
    // Catch all other failure cases from other reducers
    case actionTypes.FETCH_STAFF_STATISTICS_FAILURE:
    case actionTypes.FETCH_STUDENTS_STATISTICS_FAILURE:
    case actionTypes.FETCH_COURSE_PROGRESSION_STATISTICS_FAILURE: {
      return { ...state };
    }
    default:
      return state;
  }
}
