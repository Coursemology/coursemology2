import { combineReducers } from 'redux';
import notificationPopup from 'lib/reducers/notificationPopup';
import groupsFetch from './groupsFetch';

export default combineReducers({
  notificationPopup,
  groupsFetch,
});
