import { combineReducers } from 'redux';

import plagiarismAssessmentsReducer from './reducers/assessments';

const reducer = combineReducers({
  assessments: plagiarismAssessmentsReducer,
});

export default reducer;
