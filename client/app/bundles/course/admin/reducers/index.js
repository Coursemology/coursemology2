import { combineReducers } from 'redux';

import notificationPopup from 'lib/reducers/notificationPopup';

import lessonPlanSettings from './lessonPlanSettings';
import notificationSettings from './notificationSettings';

export default combineReducers({
  notificationPopup,
  notificationSettings,
  lessonPlanSettings,
});
