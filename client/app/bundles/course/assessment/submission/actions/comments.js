import CourseAPI from 'api/course';
import { POST_WORKFLOW_STATE } from 'lib/constants/sharedConstants';

import actionTypes from '../constants';

export function onCreateChange(topicId, text) {
  return (dispatch) => {
    dispatch({
      type: actionTypes.CREATE_COMMENT_CHANGE,
      payload: { topicId, text },
    });
  };
}

export function create(submissionQuestionId, text, isDelayedComment) {
  const payload = {
    discussion_post: {
      text,
      workflow_state: isDelayedComment ? 'delayed' : 'published',
    },
  };
  return (dispatch) => {
    dispatch({ type: actionTypes.CREATE_COMMENT_REQUEST, isDelayedComment });

    return CourseAPI.assessment.submissionQuestions
      .createComment(submissionQuestionId, payload)
      .then((response) => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.CREATE_COMMENT_SUCCESS,
          payload: data,
        });
      })
      .catch((error) => {
        dispatch({ type: actionTypes.CREATE_COMMENT_FAILURE });
        throw error;
      });
  };
}

export function onUpdateChange(postId, text) {
  return (dispatch) => {
    dispatch({
      type: actionTypes.UPDATE_COMMENT_CHANGE,
      payload: { postId, text },
    });
  };
}

export function update(topicId, postId, text) {
  const payload = { discussion_post: { text } };
  return (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_COMMENT_REQUEST });

    return CourseAPI.comments
      .update(topicId, postId, payload)
      .then((response) => response.data)
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

    return CourseAPI.comments
      .delete(topicId, postId)
      .then((response) => response.data)
      .then(() => {
        dispatch({
          type: actionTypes.DELETE_COMMENT_SUCCESS,
          payload: { topicId, postId },
        });
      })
      .catch(() => dispatch({ type: actionTypes.DELETE_COMMENT_FAILURE }));
  };
}

export function publish(topicId, postId, text) {
  const payload = {
    discussion_post: { text, workflow_state: POST_WORKFLOW_STATE.published },
  };
  return (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_COMMENT_REQUEST });

    return CourseAPI.comments
      .update(topicId, postId, payload)
      .then((response) => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.UPDATE_COMMENT_SUCCESS,
          payload: data,
        });
      })
      .catch(() => dispatch({ type: actionTypes.UPDATE_COMMENT_FAILURE }));
  };
}
