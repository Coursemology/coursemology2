import { combineReducers } from 'redux';
import notificationPopup from 'lib/reducers/notificationPopup';
import userSubscriptions from './userSubscriptions';

export default combineReducers({
  notificationPopup,
  userSubscriptions,
});
