import CourseAPI from 'api/course';
import actionTypes from './constants';

export function fetchSubmission(id) {
  return (dispatch) => {
    dispatch({ type: actionTypes.FETCH_SUBMISSION_REQUEST });

    return CourseAPI.assessment.submissions.edit(id)
      .then(response => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.FETCH_SUBMISSION_SUCCESS,
          payload: data,
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.FETCH_SUBMISSION_FAILURE });
      });
  };
}

export function updateSubmission(submissionId, payload) {
  return (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_SUBMISSION_REQUEST });

    return CourseAPI.assessment.submissions.update(submissionId, payload)
      .then(response => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.UPDATE_SUBMISSION_SUCCESS,
          payload: data,
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.UPDATE_SUBMISSION_FAILURE });
      });
  };
}

export function updateAnswer(submissionId, payload) {
  return (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_ANSWER_REQUEST });

    return CourseAPI.assessment.submissions.update(submissionId, payload)
      .then(response => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.UPDATE_ANSWER_SUCCESS,
          payload: data,
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.UPDATE_ANSWER_FAILURE });
      });
  };
}
