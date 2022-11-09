import { combineReducers } from 'redux';

import deleteConfirmation from 'lib/reducers/deleteConfirmation';
import notificationPopup from 'lib/reducers/notificationPopup';

import eventForm from './eventForm';
import flags from './flags';
import lessonPlan from './lessonPlan';
import milestoneForm from './milestoneForm';

export default combineReducers({
  notificationPopup,
  deleteConfirmation,
  flags,
  lessonPlan,
  eventForm,
  milestoneForm,
});
