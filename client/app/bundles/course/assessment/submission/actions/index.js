import CourseAPI from 'api/course';
import actionTypes from '../constants';

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
      .catch((e) => console.log(e) || dispatch({ type: actionTypes.FETCH_SUBMISSION_FAILURE }));
  };
}

export function saveDraft(submissionId, answers) {
  const payload = { submission: { answers } };
  return (dispatch) => {
    dispatch({ type: actionTypes.SAVE_DRAFT_REQUEST });

    return CourseAPI.assessment.submissions.update(submissionId, payload)
      .then(response => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.SAVE_DRAFT_SUCCESS,
          payload: data,
        });
      })
      .catch(() => dispatch({ type: actionTypes.SAVE_DRAFT_FAILURE }));
  };
}

export function submit(submissionId, answers) {
  const payload = { submission: { answers, finalise: true } };
  return (dispatch) => {
    dispatch({ type: actionTypes.SUBMISSION_REQUEST });

    return CourseAPI.assessment.submissions.update(submissionId, payload)
      .then(response => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.SUBMISSION_SUCCESS,
          payload: data,
        });
      })
      .catch(() => dispatch({ type: actionTypes.SUBMISSION_FAILURE }));
  };
}

export function unsubmit(submissionId) {
  const payload = { submission: { unsubmit: true } };
  return (dispatch) => {
    dispatch({ type: actionTypes.UNSUBMIT_REQUEST });

    return CourseAPI.assessment.submissions.update(submissionId, payload)
      .then(response => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.UNSUBMIT_SUCCESS,
          payload: data,
        });
      })
      .catch(() => dispatch({ type: actionTypes.UNSUBMIT_FAILURE }));
  };
}

export function autograde(submissionId, answers) {
  const payload = { submission: { answers, auto_grade: true } };
  return (dispatch) => {
    dispatch({ type: actionTypes.AUTOGRADE_REQUEST });

    return CourseAPI.assessment.submissions.update(submissionId, payload)
      .then(response => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.AUTOGRADE_SUCCESS,
          payload: data,
        });
      })
      .catch(() => dispatch({ type: actionTypes.AUTOGRADE_FAILURE }));
  };
}
