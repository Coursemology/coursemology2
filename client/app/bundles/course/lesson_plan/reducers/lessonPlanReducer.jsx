import Immutable from 'immutable';
import actionTypes from '../constants';

export const initialState = Immutable.fromJS({
  items: [],
  milestones: [],
  hiddenItemTypes: [],
});

export default function (state = initialState, action) {
  const { type, itemType } = action;

  switch (type) {
    case actionTypes.TOGGLE_LESSON_PLAN_ITEM_TYPE_VISIBILITY: {
      const hiddenItemTypes = state.get('hiddenItemTypes');
      const updatedList = hiddenItemTypes.includes(itemType) ?
        hiddenItemTypes.filter(hiddenType => hiddenType !== itemType) :
        hiddenItemTypes.push(itemType);
      return state.set('hiddenItemTypes', updatedList);
    }
    default:
      return state;
  }
}
