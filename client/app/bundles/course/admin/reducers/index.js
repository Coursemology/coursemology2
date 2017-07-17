import { combineReducers } from 'redux';
import notification from './notification';
import notificationSettings from './notificationSettings';

export default combineReducers({
  notification,
  notificationSettings,
});
