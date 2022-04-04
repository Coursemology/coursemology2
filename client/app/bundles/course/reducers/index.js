import { combineReducers } from 'redux';
import notificationPopup from 'lib/reducers/notificationPopup';
import userEmailSubscriptions from './userEmailSubscriptions';
import userStatistics from './userStatistics';

export default combineReducers({
  notificationPopup,
  userEmailSubscriptions,
  userStatistics,
});
