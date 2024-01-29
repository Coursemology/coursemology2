import { Operation } from 'store';
import { AssessmentMarksPerQuestionStats } from 'types/course/statistics/assessmentStatistics';

import CourseAPI from 'api/course';
import { setNotification } from 'lib/actions';

import actionTypes from '../constants';
import { statisticsActions as actions } from '../reducers/statistics';
import {
  processAncestor,
  processAssessment,
  processCourseUser,
  processSubmission,
} from '../utils/statisticsUtils';

export function fetchStatistics(
  assessmentId: number,
  failureMessage: string,
): Operation {
  return async (dispatch) => {
    dispatch({ type: actionTypes.FETCH_STATISTICS_REQUEST });
    return CourseAPI.statistics.assessment
      .fetchStatistics(assessmentId)
      .then((response) => {
        dispatch({
          type: actionTypes.FETCH_STATISTICS_SUCCESS,
          assessment: processAssessment(response.data.assessment),
          submissions: response.data.submissions.map(processSubmission),
          allStudents: response.data.allStudents.map(processCourseUser),
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.FETCH_STATISTICS_FAILURE });
        dispatch(setNotification(failureMessage));
      });
  };
}

export function fetchAssessmentStatistics(assessmentId: number): Operation {
  return async (dispatch) => {
    CourseAPI.statistics.assessment
      .fetchAssessmentStatistics(assessmentId)
      .then((response) => {
        const data = response.data;
        dispatch(
          actions.initialize({
            assessment: data.assessment,
            allStudents: data.allStudents,
            submissions: data.submissions,
            ancestors: data.ancestors,
            isLoading: false,
          }),
        );
      });
  };
}

export function fetchAncestors(
  assessmentId: number,
  failureMessage: string,
): Operation {
  return async (dispatch) => {
    dispatch({ type: actionTypes.FETCH_ANCESTORS_REQUEST });
    return CourseAPI.statistics.assessment
      .fetchAncestors(assessmentId)
      .then((response) => {
        dispatch({
          type: actionTypes.FETCH_ANCESTORS_SUCCESS,
          ancestors: response.data.assessments.map(processAncestor),
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.FETCH_ANCESTORS_FAILURE });
        dispatch(setNotification(failureMessage));
      });
  };
}

export function fetchAncestorStatistics(
  ancestorId: number,
  failureMessage: string,
): Operation {
  return async (dispatch) => {
    dispatch({ type: actionTypes.FETCH_ANCESTOR_STATISTICS_REQUEST });
    return CourseAPI.statistics.assessment
      .fetchStatistics(ancestorId)
      .then((response) => {
        dispatch({
          type: actionTypes.FETCH_ANCESTOR_STATISTICS_SUCCESS,
          assessment: processAssessment(response.data.assessment),
          submissions: response.data.submissions.map(processSubmission),
          allStudents: response.data.allStudents.map(processCourseUser),
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.FETCH_ANCESTOR_STATISTICS_FAILURE });
        dispatch(setNotification(failureMessage));
      });
  };
}

export const fetchStudentMarkPerQuestion = async (
  assessmentId: string | number,
): Promise<AssessmentMarksPerQuestionStats> => {
  const response =
    await CourseAPI.statistics.assessment.fetchMarksPerQuestionStats(
      assessmentId,
    );
  return response.data;
};
