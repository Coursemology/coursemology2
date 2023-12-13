import attachmentsAPI from 'api/Attachments';

import actionTypes from '../constants';

export default function destroy(answerId, questionId, attachmentId) {
  return (dispatch) => {
    dispatch({
      type: actionTypes.DELETE_ATTACHMENT_REQUEST,
      payload: answerId,
    });

    return attachmentsAPI
      .delete(attachmentId)
      .then((response) => response.data)
      .then(() => {
        dispatch({
          type: actionTypes.DELETE_ATTACHMENT_SUCCESS,
          payload: { answer: { answerId }, questionId, attachmentId },
        });
      })
      .catch(() =>
        dispatch({
          type: actionTypes.DELETE_ATTACHMENT_FAILURE,
          payload: answerId,
        }),
      );
  };
}
