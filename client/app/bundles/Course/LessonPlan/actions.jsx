/* eslint-disable import/prefer-default-export */
import actionTypes from './constants';

export function toggleItemTypeVisibility(itemType) {
  return {
    type: actionTypes.TOGGLE_LESSON_PLAN_ITEM_TYPE_VISIBILITY,
    itemType,
  };
}
