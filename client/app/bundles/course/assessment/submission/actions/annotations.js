// eslint-disable-next-line import/no-unresolved, import/extensions, import/no-extraneous-dependencies
import CourseAPI from 'api/course';
import actionTypes from '../constants';

export function onCreateChange(fileId, line, text) {
  return (dispatch) => {
    dispatch({
      type: actionTypes.CREATE_ANNOTATION_CHANGE,
      payload: { fileId, line, text },
    });
  };
}

export function create(submissionId, answerId, fileId, line, text) {
  const payload = {
    annotation: { line },
    discussion_post: { text },
  };
  return (dispatch) => {
    dispatch({ type: actionTypes.CREATE_ANNOTATION_REQUEST });

    return CourseAPI.assessment.submissions.createProgrammingAnnotation(
      submissionId, answerId, fileId, payload)
      .then(response => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.CREATE_ANNOTATION_SUCCESS,
          payload: { ...data, fileId, line },
        });
      })
      .catch(() => dispatch({ type: actionTypes.CREATE_ANNOTATION_FAILURE }));
  };
}

export function onUpdateChange(postId, text) {
  return (dispatch) => {
    dispatch({
      type: actionTypes.UPDATE_ANNOTATION_CHANGE,
      payload: { postId, text },
    });
  };
}

export function update(topicId, postId, text) {
  const payload = { discussion_post: { text } };
  return (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_ANNOTATION_REQUEST });

    return CourseAPI.comments.update(topicId, postId, payload)
      .then(response => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.UPDATE_ANNOTATION_SUCCESS,
          payload: data,
        });
      })
      .catch(() => dispatch({ type: actionTypes.UPDATE_ANNOTATION_FAILURE }));
  };
}

export function destroy(fileId, topicId, postId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.DELETE_ANNOTATION_REQUEST });

    return CourseAPI.comments.delete(topicId, postId)
      .then(response => response.data)
      .then(() => {
        dispatch({
          type: actionTypes.DELETE_ANNOTATION_SUCCESS,
          payload: { fileId, topicId, postId },
        });
      })
      .catch(() => dispatch({ type: actionTypes.DELETE_ANNOTATION_FAILURE }));
  };
}
