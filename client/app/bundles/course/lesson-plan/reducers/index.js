import { combineReducers } from 'redux';
import lessonPlan from './lessonPlan';
import notification from './notification';

export default combineReducers({
  lessonPlan,
  notification,
});
