import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import notificationPopup from 'lib/reducers/notificationPopup';
import groupsFetch from './groupsFetch';
import groupsDialog from './groupsDialog';
import groupsManage from './groupsManage';

export default combineReducers({
  notificationPopup,
  groupsFetch,
  groupsDialog,
  groupsManage,
  form: formReducer,
});
