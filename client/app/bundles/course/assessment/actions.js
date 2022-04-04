import { SubmissionError } from 'lib/redux-form';
import CourseAPI from 'api/course';
import { getCourseId } from 'lib/helpers/url-helpers';
import actionTypes from './constants';
import {
  processSubmission,
  processAssessment,
  processAncestor,
  processCourseUser,
} from './utils/statisticsUtils';

export function createAssessment(
  categoryId,
  tabId,
  data,
  successMessage,
  failureMessage,
) {
  const attributes = { ...data, category: categoryId, tab: tabId };
  return (dispatch) => {
    dispatch({ type: actionTypes.CREATE_ASSESSMENT_REQUEST });

    return CourseAPI.assessment.assessments
      .create(attributes)
      .then((response) => {
        dispatch({
          type: actionTypes.CREATE_ASSESSMENT_SUCCESS,
          message: successMessage,
        });
        // TODO: Remove redirection when assessment index is implemented using React.
        setTimeout(() => {
          if (response.data && response.data.id) {
            window.location = `/courses/${getCourseId()}/assessments/${
              response.data.id
            }`;
          }
        }, 200);
      })
      .catch((error) => {
        dispatch({
          type: actionTypes.CREATE_ASSESSMENT_FAILURE,
          message: failureMessage,
        });

        if (error.response && error.response.data) {
          throw new SubmissionError(error.response.data.errors);
        }
      });
  };
}

export function updateAssessment(
  assessmentId,
  data,
  successMessage,
  failureMessage,
) {
  const attributes = data;
  return (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_ASSESSMENT_REQUEST });

    return CourseAPI.assessment.assessments
      .update(assessmentId, attributes)
      .then(() => {
        dispatch({
          type: actionTypes.UPDATE_ASSESSMENT_SUCCESS,
          message: successMessage,
        });
        // TODO: Remove redirection when assessment index is implemented using React.
        setTimeout(() => {
          window.location = `/courses/${getCourseId()}/assessments/${assessmentId}`;
        }, 500);
      })
      .catch((error) => {
        dispatch({
          type: actionTypes.UPDATE_ASSESSMENT_FAILURE,
          message: failureMessage,
        });

        if (error.response && error.response.data) {
          throw new SubmissionError(error.response.data.errors);
        }
      });
  };
}

export function fetchStatistics(assessmentId, failureMessage) {
  return (dispatch) => {
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
        dispatch({
          type: actionTypes.FETCH_STATISTICS_FAILURE,
          message: failureMessage,
        });
      });
  };
}

export function fetchAncestors(assessmentId, failureMessage) {
  return (dispatch) => {
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
        dispatch({
          type: actionTypes.FETCH_ANCESTORS_FAILURE,
          message: failureMessage,
        });
      });
  };
}

export function fetchAncestorStatistics(ancestorId, failureMessage) {
  return (dispatch) => {
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
        dispatch({
          type: actionTypes.FETCH_ANCESTOR_STATISTICS_FAILURE,
          message: failureMessage,
        });
      });
  };
}
