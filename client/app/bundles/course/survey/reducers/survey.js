import actionTypes from '../constants';
import sectionReducer from './section';
import { updateOrAppend, deleteIfFound } from './utils';
import { sortSurveyElements } from '../utils';

const initialState = {};

export default function (survey = initialState, action) {
  if (String(survey.id) !== String(action.surveyId)) {
    return survey;
  }

  switch (action.type) {
    case actionTypes.DELETE_SURVEY_QUESTION_SUCCESS:
    case actionTypes.UPDATE_SURVEY_QUESTION_SUCCESS:
    case actionTypes.CREATE_SURVEY_QUESTION_SUCCESS: {
      const sections = survey.sections.map(section => sectionReducer(section, action));
      return { ...survey, sections };
    }
    case actionTypes.UPDATE_SURVEY_SECTION_SUCCESS:
    case actionTypes.CREATE_SURVEY_SECTION_SUCCESS: {
      const sections = updateOrAppend(survey.sections, action.section);
      return sortSurveyElements({ ...survey, sections });
    }
    case actionTypes.DELETE_SURVEY_SECTION_SUCCESS: {
      const sections = deleteIfFound(survey.sections, action.sectionId);
      return { ...survey, sections };
    }
    default:
      return survey;
  }
}
