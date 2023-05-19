import { combineReducers } from 'redux';

import editPageReducer from './reducers/editPage';
import formDialogReducer from './reducers/formDialog';
import monitoringReducer from './reducers/monitoring';
import statisticsPageReducer from './reducers/statisticsPage';
import submissionReducer from './submission/reducers';

const reducer = combineReducers({
  formDialog: formDialogReducer,
  editPage: editPageReducer,
  monitoring: monitoringReducer,
  statisticsPage: statisticsPageReducer,
  submission: submissionReducer,
});

export default reducer;
