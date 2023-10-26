import { combineReducers } from 'redux';

import codaveriSettingsReducer from './codaveriSettings';
import lessonPlanSettingsReducer from './lessonPlanSettings';
import notificationSettingsReducer from './notificationSettings';

const courseSettingsReducer = combineReducers({
  codaveriSettings: codaveriSettingsReducer,
  lessonPlanSettings: lessonPlanSettingsReducer,
  notificationSettings: notificationSettingsReducer,
});

export default courseSettingsReducer;
