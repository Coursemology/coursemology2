import Immutable from 'immutable';
import { combineReducers } from 'redux-immutable';
import items, { initialState as itemsInitialState } from './items';
import milestones, { initialState as milestonesInitialState } from './milestones';
import hiddenItemTypes, { initialState as hiddenItemTypesInitialState } from './hiddenItemTypes';
import notification, { initialState as notificationInitialState } from './notification';

export const initialState = Immutable.fromJS({
  items: itemsInitialState,
  milestones: milestonesInitialState,
  hiddenItemTypes: hiddenItemTypesInitialState,
  notification: notificationInitialState,
});

export default combineReducers({
  items,
  milestones,
  hiddenItemTypes,
  notification,
});
