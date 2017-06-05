import actionTypes from '../constants';
import itemReducer from './item';
import milestoneReducer from './milestone';
import { groupItemsUnderMilestones, initializeVisibility, generateTypeKey } from './utils';

const initialState = {
  items: [],
  milestones: [],
  groups: [],
  visibilityByType: {},
  notification: { message: null },
  isLoading: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case actionTypes.SET_NOTIFICATION: {
      return { ...state, notification: { message: action.message } };
    }
    case actionTypes.SET_ITEM_TYPE_VISIBILITY: {
      const visibilityByType = {
        ...state.visibilityByType,
        [action.itemType]: action.isVisible,
      };
      return { ...state, visibilityByType };
    }
    case actionTypes.LOAD_LESSON_PLAN_REQUEST: {
      return { ...state, isLoading: true };
    }
    case actionTypes.LOAD_LESSON_PLAN_FAILURE: {
      return { ...state, isLoading: false };
    }
    case actionTypes.LOAD_LESSON_PLAN_SUCCESS: {
      const items = action.items.map(generateTypeKey);
      return {
        ...state,
        items,
        milestones: action.milestones,
        groups: groupItemsUnderMilestones(items, action.milestones),
        visibilityByType: initializeVisibility(items),
        isLoading: false,
      };
    }
    case actionTypes.ITEM_UPDATE_SUCCESS: {
      const items = state.items.map(item => itemReducer(item, action));
      return {
        ...state,
        items,
        groups: groupItemsUnderMilestones(items, state.milestones),
      };
    }
    case actionTypes.MILESTONE_UPDATE_SUCCESS: {
      const milestones = state.milestones.map(item => milestoneReducer(item, action));
      return {
        ...state,
        milestones,
        groups: groupItemsUnderMilestones(state.items, milestones),
      };
    }
    default:
      return state;
  }
}
