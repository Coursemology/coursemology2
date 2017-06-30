import actions, { DATA_STATES, SAVE_STATES } from '../constants';

const initialState = {
  assessment: null,
  submission: null,
  dataState: DATA_STATES.Unfetched,
  saveState: SAVE_STATES.Idle,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case actions.FETCH_SUBMISSION_REQUEST:
      return {
        ...state,
        dataState: DATA_STATES.Fetching,
      };
    case actions.FETCH_SUBMISSION_SUCCESS:
      return {
        ...state,
        assessment: action.payload.assessment,
        submission: action.payload.submission,
        dataState: DATA_STATES.Received,
      };
    case actions.FETCH_SUBMISSION_FAILURE:
      return {
        ...state,
        dataState: DATA_STATES.Error,
      };
    case actions.SAVE_DRAFT_REQUEST:
    case actions.SUBMISSION_REQUEST:
    case actions.UNSUBMIT_REQUEST:
    case actions.AUTOGRADE_REQUEST:
      return {
        ...state,
        saveState: SAVE_STATES.Saving,
      };
    case actions.SAVE_DRAFT_SUCCESS:
    case actions.SUBMISSION_SUCCESS:
    case actions.UNSUBMIT_SUCCESS:
    case actions.SAVE_GRADE_SUCCESS:
    case actions.MARK_SUCCESS:
    case actions.PUBLISH_SUCCESS:
      return {
        ...state,
        submission: action.payload.submission,
        saveState: SAVE_STATES.Saved,
      };
    case actions.AUTOGRADE_SUCCESS:
    case actions.RESET_SUCCESS:
      return {
        ...state,
        saveState: SAVE_STATES.Saved,
      };
    case actions.SAVE_DRAFT_FAILURE:
    case actions.SUBMISSION_FAILURE:
    case actions.UNSUBMIT_FAILURE:
    case actions.AUTOGRADE_FAILURE:
      return {
        ...state,
        saveState: SAVE_STATES.Error,
      };
    default:
      return state;
  }
}
