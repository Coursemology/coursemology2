import { combineReducers } from 'redux';
import notificationPopup from 'lib/reducers/notificationPopup';
import groupsFetch from './groupsFetch';
import groupsDialog from './groupsDialog';
import groupsManage from './groupsManage';

export default combineReducers({
  notificationPopup,
  groupsFetch,
  groupsDialog,
  groupsManage,
});
