import actionTypes from '../constants';

const initialState = {
  isLoadingSurvey: false,
  isLoadingSurveys: false,
  canCreate: false,
  isQuestionMoved: false,
  isUnsubmittingResponse: false,
  disableSurveyShow: false,
};

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.LOAD_SURVEY_REQUEST: {
      return { ...state, isLoadingSurvey: true };
    }
    case actionTypes.LOAD_SURVEY_FAILURE:
    case actionTypes.LOAD_SURVEY_SUCCESS: {
      return { ...state, isLoadingSurvey: false };
    }
    case actionTypes.LOAD_SURVEYS_REQUEST: {
      return { ...state, isLoadingSurveys: true };
    }
    case actionTypes.LOAD_SURVEYS_SUCCESS: {
      return { ...state, isLoadingSurveys: false, canCreate: action.canCreate };
    }
    case actionTypes.LOAD_SURVEYS_FAILURE: {
      return { ...state, isLoadingSurveys: false };
    }
    case actionTypes.REORDER_QUESTION:
    case actionTypes.CHANGE_QUESTION_SECTION: {
      return { ...state, isQuestionMoved: true };
    }
    case actionTypes.UPDATE_QUESTION_ORDER_SUCCESS: {
      return { ...state, isQuestionMoved: false, disableSurveyShow: false };
    }
    case actionTypes.UNSUBMIT_RESPONSE_REQUEST: {
      return { ...state, isUnsubmittingResponse: true };
    }
    case actionTypes.UNSUBMIT_RESPONSE_FAILURE:
    case actionTypes.UNSUBMIT_RESPONSE_SUCCESS: {
      return { ...state, isUnsubmittingResponse: false };
    }
    case actionTypes.DELETE_SURVEY_SECTION_REQUEST:
    case actionTypes.UPDATE_QUESTION_ORDER_REQUEST:
    case actionTypes.UPDATE_SECTION_ORDER_REQUEST: {
      return { ...state, disableSurveyShow: true };
    }
    case actionTypes.DELETE_SURVEY_SECTION_SUCCESS:
    case actionTypes.DELETE_SURVEY_SECTION_FAILURE:
    case actionTypes.UPDATE_QUESTION_ORDER_FAILURE:
    case actionTypes.UPDATE_SECTION_ORDER_SUCCESS:
    case actionTypes.UPDATE_SECTION_ORDER_FAILURE: {
      return { ...state, disableSurveyShow: false };
    }
    default:
      return state;
  }
}
