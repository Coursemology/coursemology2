import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import notificationPopup from 'lib/reducers/notificationPopup';
import groupsFetch from './groupsFetch';
import groupsDialog from './groupsDialog';

export default combineReducers({
  notificationPopup,
  groupsFetch,
  groupsDialog,
  form: formReducer,
});
