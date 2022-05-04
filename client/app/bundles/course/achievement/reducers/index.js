import { combineReducers } from 'redux';
import editPage from './editPage';
import indexFormDialog from './indexFormDialog';

export default combineReducers({
  indexFormDialog,
  editPage,
});
