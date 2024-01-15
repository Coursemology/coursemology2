import { produce } from 'immer';

import actions from '../constants';

export default function (state = {}, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS:
    case actions.FINALISE_SUCCESS:
    case actions.UNSUBMIT_SUCCESS:
    case actions.SAVE_ALL_GRADE_SUCCESS:
    case actions.SAVE_GRADE_SUCCESS:
    case actions.MARK_SUCCESS:
    case actions.UNMARK_SUCCESS:
    case actions.PUBLISH_SUCCESS: {
      return produce(state, (draft) => {
        action.payload.answers.forEach((answer) => {
          draft[answer.questionId] = answer.attachments;
        });
      });
    }
    case actions.UPLOAD_TEXT_RESPONSE_FILES_SUCCESS:
      return produce(state, (draft) => {
        draft[action.payload.questionId] = action.payload.attachments;
      });
    case actions.REEVALUATE_SUCCESS:
    case actions.AUTOGRADE_SUCCESS: {
      const { questionId } = action.payload;
      return produce(state, (draft) => {
        draft[questionId] = action.payload.attachments;
      });
    }
    case actions.DELETE_ATTACHMENT_SUCCESS: {
      const { questionId, attachmentId } = action.payload;
      return produce(state, (draft) => {
        draft[questionId] = draft[questionId].filter(
          (attachment) => attachment.id !== attachmentId,
        );
      });
    }
    default:
      return state;
  }
}
