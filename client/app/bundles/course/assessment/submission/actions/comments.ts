import { Operation } from 'store';

import CourseAPI from 'api/course';
import { POST_WORKFLOW_STATE } from 'lib/constants/sharedConstants';

import actionTypes from '../constants';

export function onCreateChange(topicId: number, text: string): Operation {
  return async (dispatch) => {
    dispatch({
      type: actionTypes.CREATE_COMMENT_CHANGE,
      payload: { topicId, text },
    });
  };
}

export function create(
  submissionQuestionId: number,
  text: string,
  isDelayedComment: boolean,
): Operation {
  const payload = {
    discussion_post: {
      text,
      workflow_state: isDelayedComment ? 'delayed' : 'published',
    },
  };
  return async (dispatch) => {
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

export function onUpdateChange(postId: number, text: string): Operation {
  return async (dispatch) => {
    dispatch({
      type: actionTypes.UPDATE_COMMENT_CHANGE,
      payload: { postId, text },
    });
  };
}

export function update(
  topicId: number,
  postId: number,
  text: string,
): Operation {
  const payload = { discussion_post: { text } };
  return async (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_COMMENT_REQUEST });

    return CourseAPI.comments
      .update(topicId.toString(), postId.toString(), payload)
      .then((response) => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.UPDATE_COMMENT_SUCCESS,
          payload: data,
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.UPDATE_COMMENT_FAILURE });
      });
  };
}

export function destroy(topicId: number, postId: number): Operation {
  return async (dispatch) => {
    dispatch({ type: actionTypes.DELETE_COMMENT_REQUEST });

    return CourseAPI.comments
      .delete(topicId.toString(), postId.toString(), {})
      .then(() => {
        dispatch({
          type: actionTypes.DELETE_COMMENT_SUCCESS,
          payload: { topicId, postId },
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.DELETE_COMMENT_FAILURE });
      });
  };
}

export function publish(
  topicId: number,
  postId: number,
  text: string,
): Operation {
  const payload = {
    discussion_post: { text, workflow_state: POST_WORKFLOW_STATE.published },
  };
  return async (dispatch) => {
    dispatch({ type: actionTypes.UPDATE_COMMENT_REQUEST });

    return CourseAPI.comments
      .update(topicId.toString(), postId.toString(), payload)
      .then((response) => response.data)
      .then((data) => {
        dispatch({
          type: actionTypes.UPDATE_COMMENT_SUCCESS,
          payload: data,
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.UPDATE_COMMENT_FAILURE });
      });
  };
}

// Sets the numeric rating for an AI-generated feedback post (or null to clear it). The edited content is
// snapshotted server-side from the post lifecycle (accept/reject), so this only persists the score. Rejects on
// failure so the card can surface it.
export function rateAiFeedback(
  topicId: number,
  postId: number,
  rating: number | null,
): Operation {
  return async () => {
    await CourseAPI.comments.updateAiFeedbackRating(
      topicId.toString(),
      postId.toString(),
      rating,
    );
  };
}

// Accept: persist the edit and publish (out of draft) in one request; the server snapshots the edited content.
export function acceptAiFeedback(
  topicId: number,
  postId: number,
  text: string,
): Operation {
  const payload = {
    discussion_post: { text, workflow_state: POST_WORKFLOW_STATE.published },
  };
  return async (dispatch) => {
    await CourseAPI.comments
      .update(topicId.toString(), postId.toString(), payload)
      .then((response) => {
        dispatch({
          type: actionTypes.UPDATE_COMMENT_SUCCESS,
          payload: response.data,
        });
      });
  };
}

// Reject: persist the edit (so the before-destroy hook snapshots it) then delete the post.
export function rejectAiFeedback(
  topicId: number,
  postId: number,
  text: string,
): Operation {
  const payload = { discussion_post: { text } };
  return async (dispatch) => {
    await CourseAPI.comments
      .update(topicId.toString(), postId.toString(), payload)
      .then(() =>
        CourseAPI.comments.delete(topicId.toString(), postId.toString(), {}),
      )
      .then(() => {
        dispatch({
          type: actionTypes.DELETE_COMMENT_SUCCESS,
          payload: { topicId, postId },
        });
      });
  };
}
