import { combineReducers } from 'redux';

import lessonPlanSettingsReducer from './lessonPlanSettings';
import notificationSettingsReducer from './notificationSettings';

const courseSettingsReducer = combineReducers({
  lessonPlanSettings: lessonPlanSettingsReducer,
  notificationSettings: notificationSettingsReducer,
});

export default courseSettingsReducer;
