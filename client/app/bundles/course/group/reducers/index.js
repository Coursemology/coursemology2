import { combineReducers } from 'redux';

import notificationPopup from 'lib/reducers/notificationPopup';

import groupsDialog from './groupsDialog';
import groupsFetch from './groupsFetch';
import groupsManage from './groupsManage';

export default combineReducers({
  notificationPopup,
  groupsFetch,
  groupsDialog,
  groupsManage,
});
