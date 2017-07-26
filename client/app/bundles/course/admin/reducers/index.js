import { combineReducers } from 'redux';
import notificationPopup from 'lib/reducers/notificationPopup';
import notificationSettings from './notificationSettings';

export default combineReducers({
  notificationPopup,
  notificationSettings,
});
