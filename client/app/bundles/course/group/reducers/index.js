import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import notificationPopup from 'lib/reducers/notificationPopup';
import groupsFetch from './groupsFetch';
import groupsNew from './groupsNew';

export default combineReducers({
  notificationPopup,
  groupsFetch,
  groupsNew,
  form: formReducer,
});
