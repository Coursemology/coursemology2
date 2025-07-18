import { combineReducers } from 'redux';

import similarityAssessmentsReducer from './reducers/assessments';

const reducer = combineReducers({
  assessments: similarityAssessmentsReducer,
});

export default reducer;
