import actionTypes from '../constants';
import { updateOrAppend, deleteIfFound } from './utils';

const initialState = {};

export default function (survey = initialState, action) {
  if (String(survey.id) !== String(action.surveyId)) {
    return survey;
  }

  switch (action.type) {
    case actionTypes.UPDATE_SURVEY_QUESTION_SUCCESS:
    case actionTypes.CREATE_SURVEY_QUESTION_SUCCESS: {
      const questions = updateOrAppend(survey.questions, action.question);
      return { ...survey, questions };
    }
    case actionTypes.DELETE_SURVEY_QUESTION_SUCCESS: {
      const questions = deleteIfFound(survey.questions, action.questionId);
      return { ...survey, questions };
    }
    default:
      return survey;
  }
}
