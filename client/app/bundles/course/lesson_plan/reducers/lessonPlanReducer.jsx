import Immutable from 'immutable';
import { combineReducers } from 'redux-immutable';
import items, { initialState as itemsInitialState } from './items';
import milestones, { initialState as milestonesInitialState } from './milestones';
import hiddenItemTypes, { initialState as hiddenItemTypesInitialState } from './hiddenItemTypes';

export const initialState = Immutable.fromJS({
  items: itemsInitialState,
  milestones: milestonesInitialState,
  hiddenItemTypes: hiddenItemTypesInitialState,
});

export default combineReducers({
  items,
  milestones,
  hiddenItemTypes,
});
