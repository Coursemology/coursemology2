import { SubmissionError } from 'redux-form';
import CourseAPI from 'api/course';
import { getCourseId } from 'lib/helpers/url-helpers';
import actionTypes from './constants';

export function createAssessment(
  categoryId,
  tabId,
  data,
  successMessage,
  failureMessage
) {
  const attributes = { ...data, category: categoryId, tab: tabId };
  return (dispatch) => {
    dispatch({ type: actionTypes.CREATE_ASSESSMENT_REQUEST });

    return CourseAPI.assessment.assessments.create(attributes)
      .then((response) => {
        dispatch({
          type: actionTypes.CREATE_ASSESSMENT_SUCCESS,
          message: successMessage,
        });
        // TODO: Remove redirection when assessment index is implemented using React.
        setTimeout(() => {
          if (response.data && response.data.id) {
            window.location = `/courses/${getCourseId()}/assessments/${response.data.id}`;
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

export function updateAssessment(assessmentId, data, successMessage, failureMessage) {
  const attributes = data;
  return (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_ASSESSMENT_REQUEST });

    return CourseAPI.assessment.assessments.update(assessmentId, attributes)
      .then(() => {
        dispatch({
          type: actionTypes.UPDATE_ASSESSMENT_SUCCESS,
          message: successMessage,
        });
        // TODO: Remove redirection when assessment index is implemented using React.
        setTimeout(() => {
          window.location =
            `/courses/${getCourseId()}/assessments/${assessmentId}`;
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
