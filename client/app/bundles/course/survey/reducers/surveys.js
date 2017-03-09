import actionTypes from '../constants';
import surveyReducer from './survey';
import { updateOrAppend, deleteIfFound } from './utils';

export default function (state = [], action) {
  switch (action.type) {
    case actionTypes.CREATE_SURVEY_SUCCESS: {
      return [...state, action.survey];
    }
    case actionTypes.UPDATE_SURVEY_SUCCESS:
    case actionTypes.LOAD_SURVEY_SUCCESS: {
      return updateOrAppend(state, action.survey);
    }
    case actionTypes.LOAD_SURVEYS_SUCCESS: {
      return action.surveys;
    }
    case actionTypes.DELETE_SURVEY_SUCCESS: {
      return deleteIfFound(state, action.surveyId);
    }

    case actionTypes.UPDATE_SURVEY_SECTION_SUCCESS:
    case actionTypes.DELETE_SURVEY_SECTION_SUCCESS:
    case actionTypes.CREATE_SURVEY_SECTION_SUCCESS:
    case actionTypes.UPDATE_SURVEY_QUESTION_SUCCESS:
    case actionTypes.DELETE_SURVEY_QUESTION_SUCCESS:
    case actionTypes.CREATE_SURVEY_QUESTION_SUCCESS: {
      return state.map(survey => surveyReducer(survey, action));
    }
    default:
      return state;
  }
}
