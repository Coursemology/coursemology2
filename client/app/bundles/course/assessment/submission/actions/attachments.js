import AttachmentsAPI from 'api/Attachments';
import actionTypes from '../constants';

export default function destroy(questionId, attachmentId) {
  return (dispatch) => {
    dispatch({ type: actionTypes.DELETE_ATTACHMENT_REQUEST });

    return AttachmentsAPI.delete(attachmentId)
      .then(response => response.data)
      .then(() => {
        dispatch({
          type: actionTypes.DELETE_ATTACHMENT_SUCCESS,
          payload: { questionId, attachmentId },
        });
      })
      .catch(() => dispatch({ type: actionTypes.DELETE_ATTACHMENT_FAILURE }));
  };
}
