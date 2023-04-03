import { combineReducers } from 'redux';

import editPage from './editPage';
import formDialog from './formDialog';
import monitoring from './monitoring';
import statisticsPage from './statisticsPage';

export default combineReducers({
  formDialog,
  editPage,
  monitoring,
  statisticsPage,
});
