import { Operation } from 'store';

import CourseAPI from 'api/course';
import { setNotification } from 'lib/actions';

import { processStudentPerformance } from './utils/parseCourseResponse';
import { processStaff } from './utils/parseStaffResponse';
import { processStudent } from './utils/parseStudentsResponse';
import actionTypes from './constants';

export const fetchStudentsStatistics =
  (failureMessage: string): Operation =>
  async (dispatch) => {
    dispatch({ type: actionTypes.FETCH_STUDENTS_STATISTICS_REQUEST });

    return CourseAPI.statistics.course
      .fetchAllStudentStatistics()
      .then((response) => {
        dispatch({
          type: actionTypes.FETCH_STUDENTS_STATISTICS_SUCCESS,
          students: response.data.students.map(processStudent),
          metadata: {
            isCourseGamified: response.data.metadata.isCourseGamified,
            showVideo: response.data.metadata.showVideo,
            courseVideoCount: parseInt(
              response.data.metadata.courseVideoCount,
              10,
            ),
            hasGroupManagers: response.data.metadata.hasGroupManagers,
            hasMyStudents: response.data.metadata.hasMyStudents,
          },
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.FETCH_STUDENTS_STATISTICS_FAILURE });
        dispatch(setNotification(failureMessage));
      });
  };

export const fetchStaffStatistics =
  (failureMessage: string): Operation =>
  async (dispatch) => {
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
        dispatch({ type: actionTypes.FETCH_STAFF_STATISTICS_FAILURE });
        dispatch(setNotification(failureMessage));
      });
  };

export const fetchCourseProgressionStatistics =
  (failureMessage: string): Operation =>
  async (dispatch) => {
    dispatch({ type: actionTypes.FETCH_COURSE_PROGRESSION_STATISTICS_REQUEST });

    return CourseAPI.statistics.course
      .fetchCourseProgressionStatistics()
      .then((response) => {
        dispatch({
          type: actionTypes.FETCH_COURSE_PROGRESSION_STATISTICS_SUCCESS,
          assessments: response.data.assessments,
          submissions: response.data.submissions,
        });
      })
      .catch(() => {
        dispatch({
          type: actionTypes.FETCH_COURSE_PROGRESSION_STATISTICS_FAILURE,
        });

        dispatch(setNotification(failureMessage));
      });
  };

export const fetchCoursePerformanceStatistics =
  (failureMessage: string): Operation =>
  async (dispatch) => {
    dispatch({ type: actionTypes.FETCH_COURSE_PERFORMANCE_STATISTICS_REQUEST });

    return CourseAPI.statistics.course
      .fetchCoursePerformanceStatistics()
      .then((response) => {
        dispatch({
          type: actionTypes.FETCH_COURSE_PERFORMANCE_STATISTICS_SUCCESS,
          students: response.data.students.map(processStudentPerformance),
          metadata: {
            hasPersonalizedTimeline:
              response.data.metadata.hasPersonalizedTimeline,
            isCourseGamified: response.data.metadata.isCourseGamified,
            showVideo: response.data.metadata.showVideo,
            courseVideoCount: parseInt(
              response.data.metadata.courseVideoCount,
              10,
            ),
            courseAssessmentCount: parseInt(
              response.data.metadata.courseAssessmentCount,
              10,
            ),
            courseAchievementCount: parseInt(
              response.data.metadata.courseAchievementCount,
              10,
            ),
            maxLevel: parseInt(response.data.metadata.maxLevel, 10),
            hasGroupManagers: response.data.metadata.hasGroupManagers,
          },
        });
      })
      .catch(() => {
        dispatch({
          type: actionTypes.FETCH_COURSE_PERFORMANCE_STATISTICS_FAILURE,
        });

        dispatch(setNotification(failureMessage));
      });
  };
