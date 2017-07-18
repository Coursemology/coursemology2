import actions from '../constants';

const initialState = {
  isLoading: true,
  isSaving: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_REQUEST:
      return {
        ...state,
        isLoading: true,
      };
    case actions.FETCH_SUBMISSION_SUCCESS:
    case actions.FETCH_SUBMISSION_FAILURE:
      return {
        ...state,
        isLoading: false,
      };
    case actions.SAVE_DRAFT_REQUEST:
    case actions.SAVE_GRADE_REQUEST:
    case actions.FINALISE_REQUEST:
    case actions.UNSUBMIT_REQUEST:
    case actions.AUTOGRADE_REQUEST:
    case actions.RESET_REQUEST:
    case actions.MARK_REQUEST:
    case actions.UNMARK_REQUEST:
    case actions.PUBLISH_REQUEST:
      return {
        ...state,
        isSaving: true,
      };
    case actions.SAVE_DRAFT_SUCCESS:
    case actions.SAVE_GRADE_SUCCESS:
    case actions.FINALISE_SUCCESS:
    case actions.UNSUBMIT_SUCCESS:
    case actions.AUTOGRADE_SUCCESS:
    case actions.RESET_SUCCESS:
    case actions.MARK_SUCCESS:
    case actions.UNMARK_SUCCESS:
    case actions.PUBLISH_SUCCESS:
      return {
        ...state,
        isSaving: false,
      };
    case actions.SAVE_DRAFT_FAILURE:
    case actions.SAVE_GRADE_FAILURE:
    case actions.FINALISE_FAILURE:
    case actions.UNSUBMIT_FAILURE:
    case actions.AUTOGRADE_FAILURE:
    case actions.RESET_FAILURE:
    case actions.MARK_FAILURE:
    case actions.UNMARK_FAILURE:
    case actions.PUBLISH_FAILURE:
      return {
        ...state,
        isSaving: false,
      };
    default:
      return state;
  }
}
