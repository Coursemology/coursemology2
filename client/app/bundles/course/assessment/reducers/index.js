import { combineReducers } from 'redux';

import editPage from './editPage';
import formDialog from './formDialog';

export default combineReducers({
  formDialog,
  editPage,
});
