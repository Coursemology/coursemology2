import { combineReducers } from 'redux';

import editPage from './editPage';
import formDialog from './formDialog';
import statisticsPage from './statisticsPage';

export default combineReducers({
  formDialog,
  editPage,
  statisticsPage,
});
