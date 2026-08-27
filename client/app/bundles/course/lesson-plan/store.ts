import { combineReducers } from 'redux';

import flagsReducer, { flagsActions } from './reducers/flags';
import lessonPlanReducer, { lessonPlanActions } from './reducers/lessonPlan';

const reducer = combineReducers({
  flags: flagsReducer,
  lessonPlan: lessonPlanReducer,
});

export const actions = { ...lessonPlanActions, ...flagsActions };

export default reducer;
