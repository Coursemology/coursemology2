import { combineReducers } from 'redux';
import notificationPopup from 'lib/reducers/notificationPopup';
import deleteConfirmation from 'lib/reducers/deleteConfirmation';
import flags from './flags';
import lessonPlan from './lessonPlan';
import eventForm from './eventForm';
import milestoneForm from './milestoneForm';

export default combineReducers({
  notificationPopup,
  deleteConfirmation,
  flags,
  lessonPlan,
  eventForm,
  milestoneForm,
});
