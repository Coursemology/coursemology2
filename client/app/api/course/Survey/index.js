import SurveysAPI from './Surveys';
import QuestionsAPI from './Questions';
import ResponsesAPI from './Responses';

const SurveyAPI = {
  surveys: new SurveysAPI(),
  questions: new QuestionsAPI(),
  responses: new ResponsesAPI(),
};

Object.freeze(SurveyAPI);

export default SurveyAPI;
