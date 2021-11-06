import { combineReducers } from 'redux';
import notificationPopup from 'lib/reducers/notificationPopup';
import userEmailSubscriptions from './userEmailSubscriptions';

export default combineReducers({
  notificationPopup,
  userEmailSubscriptions,
});
