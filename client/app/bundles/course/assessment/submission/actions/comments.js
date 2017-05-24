import CourseAPI from 'api/course';
import actionTypes from '../constants';

export function onCreateChange(topicId, comment) {
  return (dispatch) => {
    dispatch({
      type: actionTypes.CREATE_COMMENT_CHANGE,
      payload: { topicId, comment },
    });
  };
}

export function create(submissionQuestionId, comment) {
  const payload = { discussion_post: { text: comment } };
  return (dispatch) => {
    dispatch({ type: actionTypes.CREATE_COMMENT_REQUEST });

    return CourseAPI.assessment.submissionQuestions.createComment(submissionQuestionId, payload)
      .then(response => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.CREATE_COMMENT_SUCCESS,
          payload: data,
        });
      })
      .catch(() => dispatch({ type: actionTypes.CREATE_COMMENT_FAILURE }));
  };
}

export function onUpdateChange(postId, comment) {
  return (dispatch) => {
    dispatch({
      type: actionTypes.UPDATE_COMMENT_CHANGE,
      payload: { postId, comment },
    });
  };
}

export function update(topicId, postId, comment) {
  const payload = { discussion_post: { text: comment } };
  return (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_COMMENT_REQUEST });

    return CourseAPI.comments.update(topicId, postId, payload)
      .then(response => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.UPDATE_COMMENT_SUCCESS,
          payload: data,
        });
      })
      .catch(() => dispatch({ type: actionTypes.UPDATE_COMMENT_FAILURE }));
  };
}

export function destroy(topicId, postId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.DELETE_COMMENT_REQUEST });

    return CourseAPI.comments.delete(topicId, postId)
      .then(response => response.data)
      .then(() => {
        dispatch({
          type: actionTypes.DELETE_COMMENT_SUCCESS,
          payload: { topicId, postId },
        });
      })
      .catch(() => dispatch({ type: actionTypes.DELETE_COMMENT_FAILURE }));
  };
}
