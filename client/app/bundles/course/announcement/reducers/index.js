import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import notificationPopup from 'lib/reducers/notificationPopup';
import deleteConfirmation from 'lib/reducers/deleteConfirmation';
import announcementsFlags from './announcementsFlags';
import announcements from './announcements';
import announcementForm from './announcementForm';

export default combineReducers({
  notificationPopup,
  deleteConfirmation,
  announcements,
  announcementForm,
  announcementsFlags,
  form: formReducer,
});
