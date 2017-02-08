import axios from 'lib/axios';
import { SubmissionError } from 'redux-form';
import actionTypes from './constants';

/* eslint-disable import/prefer-default-export */
export function createAssessment(
  courseId,
  categoryId,
  tabId,
  data,
  successMessage,
  failureMessage
) {
  const attributes = { ...data, category: categoryId, tab: tabId };
  return (dispatch) => {
    dispatch({ type: actionTypes.CREATE_ASSESSMENT_REQUEST });

    return axios.post(`/courses/${courseId}/assessments`, attributes)
      .then((response) => {
        dispatch({
          type: actionTypes.CREATE_ASSESSMENT_SUCCESS,
          message: successMessage,
        });
        // TODO: Remove redirection when assessment index is implemented using React.
        setTimeout(() => {
          if (response.data && response.data.id) {
            window.location = `/courses/${courseId}/assessments/${response.data.id}`;
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
