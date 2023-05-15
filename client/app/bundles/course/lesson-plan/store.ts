/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { combineReducers } from 'redux';

import eventFormReducer from './reducers/eventForm';
import flagsReducer from './reducers/flags';
import lessonPlanReducer from './reducers/lessonPlan';
import milestoneFormReducer from './reducers/milestoneForm';
import actionTypes from './constants';

const reducer = combineReducers({
  flags: flagsReducer,
  lessonPlan: lessonPlanReducer,
  eventForm: eventFormReducer,
  milestoneForm: milestoneFormReducer,
});

export const actions = {
  setItemTypeVisibility: (itemType, isVisible) => ({
    type: actionTypes.SET_ITEM_TYPE_VISIBILITY,
    itemType,
    isVisible,
  }),
  setColumnVisibility: (field, isVisible) => ({
    type: actionTypes.SET_COLUMN_VISIBILITY,
    field,
    isVisible,
  }),
  showMilestoneForm: (formParams) => ({
    type: actionTypes.MILESTONE_FORM_SHOW,
    formParams,
  }),
  hideMilestoneForm: () => ({ type: actionTypes.MILESTONE_FORM_HIDE }),
  showEventForm: (formParams) => ({
    type: actionTypes.EVENT_FORM_SHOW,
    formParams,
  }),
  hideEventForm: () => ({ type: actionTypes.EVENT_FORM_HIDE }),
};

export default reducer;
