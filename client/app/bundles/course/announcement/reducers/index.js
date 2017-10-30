import { combineReducers } from 'redux';
import notificationPopup from 'lib/reducers/notificationPopup';
import deleteConfirmation from 'lib/reducers/deleteConfirmation';
import announcementsFlags from './announcementsFlags';
import announcements from './announcements';

export default combineReducers({
  notificationPopup,
  deleteConfirmation,
  announcements,
  announcementsFlags,
});
