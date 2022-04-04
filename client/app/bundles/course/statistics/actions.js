import CourseAPI from 'api/course';
import actionTypes from './constants';
import {
  processAssessment,
  processStudentPerformance,
  processSubmissions,
} from './utils/parseCourseResponse';
import { processStaff } from './utils/parseStaffResponse';
import { processStudent } from './utils/parseStudentsResponse';

export function fetchStudentsStatistics(failureMessage) {
  return (dispatch) => {
    dispatch({ type: actionTypes.FETCH_STUDENTS_STATISTICS_REQUEST });

    return CourseAPI.statistics.course
      .fetchAllStudentStatistics()
      .then((response) => {
        dispatch({
          type: actionTypes.FETCH_STUDENTS_STATISTICS_SUCCESS,
          students: response.data.students.map(processStudent),
          assessments: response.data.assessments.map(processAssessment),
          isCourseGamified: response.data.isCourseGamified,
          hasGroupManagers: response.data.hasGroupManagers,
        });
      })
      .catch(() => {
        dispatch({
          type: actionTypes.FETCH_STUDENTS_STATISTICS_FAILURE,
          message: failureMessage,
        });
      });
  };
}

export function fetchStaffStatistics(failureMessage) {
  return (dispatch) => {
    dispatch({ type: actionTypes.FETCH_STAFF_STATISTICS_REQUEST });

    return CourseAPI.statistics.course
      .fetchAllStaffStatistics()
      .then((response) => {
        dispatch({
          type: actionTypes.FETCH_STAFF_STATISTICS_SUCCESS,
          staff: response.data.staff.map(processStaff),
        });
      })
      .catch(() => {
        dispatch({
          type: actionTypes.FETCH_STAFF_STATISTICS_FAILURE,
          message: failureMessage,
        });
      });
  };
}

export function fetchCourseProgressionStatistics(failureMessage) {
  return (dispatch) => {
    dispatch({ type: actionTypes.FETCH_COURSE_PROGRESSION_STATISTICS_REQUEST });

    return CourseAPI.statistics.course
      .fetchCourseProgressionStatistics()
      .then((response) => {
        dispatch({
          type: actionTypes.FETCH_COURSE_PROGRESSION_STATISTICS_SUCCESS,
          assessments: response.data.assessments.map(processAssessment),
          submissions: response.data.submissions.map(processSubmissions),
        });
      })
      .catch(() => {
        dispatch({
          type: actionTypes.FETCH_COURSE_PROGRESSION_STATISTICS_FAILURE,
          message: failureMessage,
        });
      });
  };
}

export function fetchCoursePerformanceStatistics(failureMessage) {
  return (dispatch) => {
    dispatch({ type: actionTypes.FETCH_COURSE_PERFORMANCE_STATISTICS_REQUEST });

    return CourseAPI.statistics.course
      .fetchCoursePerformanceStatistics()
      .then((response) => {
        dispatch({
          type: actionTypes.FETCH_COURSE_PERFORMANCE_STATISTICS_SUCCESS,
          students: response.data.students.map(processStudentPerformance),
          hasPersonalizedTimeline: response.data.hasPersonalizedTimeline,
          isCourseGamified: response.data.isCourseGamified,
          showVideo: response.data.showVideo,
          courseVideoCount: parseInt(response.data.courseVideoCount, 10),
        });
      })
      .catch(() => {
        dispatch({
          type: actionTypes.FETCH_COURSE_PERFORMANCE_STATISTICS_FAILURE,
          message: failureMessage,
        });
      });
  };
}
