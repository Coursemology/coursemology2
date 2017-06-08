import actions from '../constants';

export default function (state = {}, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_SUCCESS:
    case actions.SAVE_DRAFT_SUCCESS:
    case actions.SUBMISSION_SUCCESS:
    case actions.UNSUBMIT_SUCCESS:
    case actions.MARK_SUCCESS:
    case actions.PUBLISH_SUCCESS: {
      return {
        ...state,
        ...action.payload.annotations.reduce((obj, annotation) =>
          ({ ...obj, [annotation.fileId]: annotation })
        , {}),
      };
    }
    case actions.CREATE_ANNOTATION_SUCCESS:
    case actions.DELETE_ANNOTATION_SUCCESS:
    default:
      return state;
  }
}
