import { combineReducers } from 'redux';
import notificationPopup from 'lib/reducers/notificationPopup';
import notificationSettings from './notificationSettings';
import lessonPlanSettings from './lessonPlanSettings';
import personalizedTimelineSettings from './personalizedTimelineSettings';

export default combineReducers({
  notificationPopup,
  notificationSettings,
  lessonPlanSettings,
  personalizedTimelineSettings,
});
