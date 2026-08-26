/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { combineReducers } from 'redux';

import flagsReducer from './reducers/flags';
import lessonPlanReducer from './reducers/lessonPlan';
import actionTypes from './constants';

const reducer = combineReducers({
  flags: flagsReducer,
  lessonPlan: lessonPlanReducer,
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
};

export default reducer;
