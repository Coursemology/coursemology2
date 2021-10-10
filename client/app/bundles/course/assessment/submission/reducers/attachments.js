import actions from '../constants';

export default function (state = {}, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS:
    case actions.SAVE_DRAFT_SUCCESS:
    case actions.FINALISE_SUCCESS:
    case actions.UNSUBMIT_SUCCESS:
    case actions.SAVE_GRADE_SUCCESS:
    case actions.MARK_SUCCESS:
    case actions.UNMARK_SUCCESS:
    case actions.PUBLISH_SUCCESS:
      return {
        ...state,
        ...action.payload.answers.reduce(
          (obj, answer) => ({
            ...obj,
            [answer.questionId]: answer.attachments,
          }),
          {}
        ),
      };
    case actions.AUTOGRADE_SUCCESS: {
      const { questionId } = action.payload;
      return {
        ...state,
        [questionId]: action.payload.attachments,
      };
    }
    case actions.DELETE_ATTACHMENT_SUCCESS: {
      const { questionId, attachmentId } = action.payload;
      return {
        ...state,
        [questionId]: state[questionId].filter(
          (attachment) => attachment.id !== attachmentId
        ),
      };
    }
    default:
      return state;
  }
}
