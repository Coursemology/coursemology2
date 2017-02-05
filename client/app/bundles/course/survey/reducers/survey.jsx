import actionTypes from '../constants';

const initialState = {};

export default function (survey = initialState, action) {
  if (String(survey.id) !== String(action.surveyId)) {
    return survey;
  }

  switch (action.type) {
    case actionTypes.CREATE_SURVEY_QUESTION_SUCCESS: {
      const questionIndex =
        survey.questions.findIndex(question => String(question.id) === String(action.data.id));
      const questions = questionIndex === -1 ?
        [...survey.questions, action.data] :
        Object.assign([], survey.questions, { [questionIndex]: action.data });
      return { ...survey, questions }
    }
    default:
      return survey;
  }
}
