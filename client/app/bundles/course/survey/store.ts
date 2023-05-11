import { combineReducers } from 'redux';

import questionFormReducer from './reducers/questionForm';
import responseFormReducer from './reducers/responseForm';
import responsesReducer from './reducers/responses';
import resultsReducer from './reducers/results';
import sectionFormReducer from './reducers/sectionForm';
import surveyFormReducer from './reducers/surveyForm';
import surveysReducer from './reducers/surveys';
import surveysFlagsReducer from './reducers/surveysFlags';

const reducer = combineReducers({
  surveys: surveysReducer,
  responses: responsesReducer,
  results: resultsReducer,
  surveyForm: surveyFormReducer,
  questionForm: questionFormReducer,
  responseForm: responseFormReducer,
  sectionForm: sectionFormReducer,
  surveysFlags: surveysFlagsReducer,
});

export default reducer;
