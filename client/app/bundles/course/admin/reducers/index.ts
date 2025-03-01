import { combineReducers } from 'redux';

import codaveriSettingsReducer from './codaveriSettings';
import lessonPlanSettingsReducer from './lessonPlanSettings';
import notificationSettingsReducer from './notificationSettings';
import ragWiseSettingsReducer from './ragWiseSettings';

const courseSettingsReducer = combineReducers({
  codaveriSettings: codaveriSettingsReducer,
  lessonPlanSettings: lessonPlanSettingsReducer,
  notificationSettings: notificationSettingsReducer,
  ragWiseSettings: ragWiseSettingsReducer,
});

export default courseSettingsReducer;
