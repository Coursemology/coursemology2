import { combineReducers } from 'redux';

import editPageReducer from './reducers/editPage';
import formDialogReducer from './reducers/formDialog';
import monitoringReducer from './reducers/monitoring';
import statisticsReducer from './reducers/statistics';
import submissionReducer from './submission/reducers';

const reducer = combineReducers({
  formDialog: formDialogReducer,
  editPage: editPageReducer,
  monitoring: monitoringReducer,
  statistics: statisticsReducer,
  submission: submissionReducer,
});

export default reducer;
