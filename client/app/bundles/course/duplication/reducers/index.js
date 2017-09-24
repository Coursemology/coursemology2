import { combineReducers } from 'redux';
import notificationPopup from 'lib/reducers/notificationPopup';
import objectDuplication from './objectDuplication';

export default combineReducers({
  notificationPopup,
  objectDuplication,
});
