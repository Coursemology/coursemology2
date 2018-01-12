import { deleteIfFound, updateOrAppend } from 'lib/helpers/reducer-helpers';
import actionTypes from '../constants';
import { groupItemsUnderMilestones, initializeVisibility, generateTypeKey, generateVisibilitySettings } from './utils';

const initialState = {
  items: [],
  milestones: [],
  groups: [],
  visibilityByType: {},
  isLoading: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
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
      const visibilitySettings = generateVisibilitySettings(action.visibilitySettings);
      return {
        ...state,
        items,
        milestones: action.milestones,
        groups: groupItemsUnderMilestones(items, action.milestones),
        visibilityByType: initializeVisibility(items, visibilitySettings),
        isLoading: false,
      };
    }
    case actionTypes.ITEM_UPDATE_SUCCESS: {
      const item = action.item.lesson_plan_item_type ? generateTypeKey(action.item) : action.item;
      const items = updateOrAppend(state.items, item);
      return {
        ...state,
        items,
        groups: groupItemsUnderMilestones(items, state.milestones),
      };
    }
    case actionTypes.MILESTONE_CREATE_SUCCESS: {
      const milestones = [...state.milestones, action.milestone];
      return {
        ...state,
        milestones,
        groups: groupItemsUnderMilestones(state.items, milestones),
      };
    }
    case actionTypes.MILESTONE_UPDATE_SUCCESS: {
      const milestones = updateOrAppend(state.milestones, action.milestone);
      return {
        ...state,
        milestones,
        groups: groupItemsUnderMilestones(state.items, milestones),
      };
    }
    case actionTypes.MILESTONE_DELETE_SUCCESS: {
      const milestones = deleteIfFound(state.milestones, action.milestoneId);
      return {
        ...state,
        milestones,
        groups: groupItemsUnderMilestones(state.items, milestones),
      };
    }
    case actionTypes.EVENT_CREATE_SUCCESS: {
      const items = [...state.items, generateTypeKey(action.event)];
      const { visibilityByType } = state;
      return {
        ...state,
        items,
        groups: groupItemsUnderMilestones(items, state.milestones),
        visibilityByType: initializeVisibility(items, visibilityByType),
      };
    }
    case actionTypes.EVENT_UPDATE_SUCCESS: {
      const items = updateOrAppend(state.items, generateTypeKey(action.event));
      const { visibilityByType } = state;
      return {
        ...state,
        items,
        groups: groupItemsUnderMilestones(items, state.milestones),
        visibilityByType: initializeVisibility(items, visibilityByType),
      };
    }
    case actionTypes.EVENT_DELETE_SUCCESS: {
      const items = deleteIfFound(state.items, action.itemId);
      const { visibilityByType } = state;
      return {
        ...state,
        items,
        groups: groupItemsUnderMilestones(items, state.milestones),
        visibilityByType: initializeVisibility(items, visibilityByType),
      };
    }
    default:
      return state;
  }
}
