import actions, { DATA_STATES } from '../constants';

const initialState = {
  assessment: null,
  canGrade: false,
  canUpdate: false,
  maxStep: null,
  progress: null,
  dataState: DATA_STATES.Unfetched,
};

export default function submissionEditReducer(state = initialState, action) {
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
        canGrade: action.payload.canGrade,
        canUpdate: action.payload.canUpdate,
        maxStep: action.payload.maxStep,
        progress: action.payload.progress,
        dataState: DATA_STATES.Received,
      };
    case actions.FETCH_SUBMISSION_FAILURE:
      return {
        ...state,
        dataState: DATA_STATES.Error,
      };
    case actions.UPDATE_SUBMISSION_REQUEST:
      return {
        ...state,
        dataState: DATA_STATES.Fetching,
      };
    case actions.UPDATE_SUBMISSION_SUCCESS:
      return {
        ...state,
        progress: action.payload.progress,
        dataState: DATA_STATES.Received,
      };
    case actions.UPDATE_SUBMISSION_FAILURE:
      return {
        ...state,
        dataState: DATA_STATES.Error,
      };
    case actions.UPDATE_ANSWER_REQUEST:
      return {
        ...state,
        dataState: DATA_STATES.Fetching,
      };
    case actions.UPDATE_ANSWER_SUCCESS:
      return {
        ...state,
        dataState: DATA_STATES.Received,
      };
    case actions.UPDATE_ANSWER_FAILURE:
      return {
        ...state,
        dataState: DATA_STATES.Error,
      };
    default:
      return state;
  }
}
