import Immutable from 'immutable';
import actionTypes from '../constants';

export const initialState = Immutable.fromJS([]);

export default function (state = initialState, action) {
  const { type, itemType } = action;

  switch (type) {
    case actionTypes.TOGGLE_LESSON_PLAN_ITEM_TYPE_VISIBILITY: {
      const updatedList = state.includes(itemType) ?
        state.filter(hiddenType => hiddenType !== itemType) :
        state.push(itemType);
      return updatedList;
    }
    default:
      return state;
  }
}
