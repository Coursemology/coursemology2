import { combineReducers } from 'redux';
import notificationPopup from 'lib/reducers/notificationPopup';
import notificationSettings from './notificationSettings';
import lessonPlanItemSettings from './lessonPlanItemSettings';

export default combineReducers({
  notificationPopup,
  notificationSettings,
  lessonPlanItemSettings,
});
