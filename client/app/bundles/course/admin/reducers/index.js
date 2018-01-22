import { combineReducers } from 'redux';
import notificationPopup from 'lib/reducers/notificationPopup';
import notificationSettings from './notificationSettings';
import lessonPlanSettings from './lessonPlanSettings';

export default combineReducers({
  notificationPopup,
  notificationSettings,
  lessonPlanSettings,
});
