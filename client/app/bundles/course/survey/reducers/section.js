import actionTypes from '../constants';
import { updateOrAppend, deleteIfFound } from './utils';
import { sortSectionElements } from '../utils';

const initialState = {};

export default function (section = initialState, action) {
  if (String(section.id) !== String(action.sectionId)) {
    return section;
  }

  switch (action.type) {
    case actionTypes.UPDATE_SURVEY_QUESTION_SUCCESS:
    case actionTypes.CREATE_SURVEY_QUESTION_SUCCESS: {
      const questions = updateOrAppend(section.questions, action.question);
      return sortSectionElements({ ...section, questions });
    }
    case actionTypes.DELETE_SURVEY_QUESTION_SUCCESS: {
      const questions = deleteIfFound(section.questions, action.questionId);
      return { ...section, questions };
    }
    default:
      return section;
  }
}
