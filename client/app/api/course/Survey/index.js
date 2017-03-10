import SurveysAPI from './Surveys';
import QuestionsAPI from './Questions';
import ResponsesAPI from './Responses';
import SectionsAPI from './Sections';

const SurveyAPI = {
  surveys: new SurveysAPI(),
  questions: new QuestionsAPI(),
  responses: new ResponsesAPI(),
  sections: new SectionsAPI(),
};

Object.freeze(SurveyAPI);

export default SurveyAPI;
