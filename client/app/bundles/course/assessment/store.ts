import { combineReducers } from 'redux';

import editPageReducer from './reducers/editPage';
import formDialogReducer from './reducers/formDialog';
import generatePageReducer from './reducers/generation';
import liveFeedbackHistoryReducer from './reducers/liveFeedback';
import monitoringReducer from './reducers/monitoring';
import statisticsReducer from './reducers/statistics';
import submissionReducer from './submission/reducers';

const reducer = combineReducers({
  formDialog: formDialogReducer,
  editPage: editPageReducer,
  generatePage: generatePageReducer,
  monitoring: monitoringReducer,
  statistics: statisticsReducer,
  submission: submissionReducer,
  liveFeedback: liveFeedbackHistoryReducer,
});

export default reducer;
