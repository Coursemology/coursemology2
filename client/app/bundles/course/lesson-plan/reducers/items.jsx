import Immutable from 'immutable';
import actionTypes from '../constants';

export const initialState = Immutable.fromJS([]);

export default function (state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case actionTypes.ITEM_UPDATE_REQUEST: {
      const [index, item] = state.findEntry(val => val.get('id') === payload.id);
      return state.set(index, item.set('isUpdating', true));
    }
    case actionTypes.ITEM_UPDATE_SUCCESS: {
      const [index, item] = state.findEntry(val => val.get('id') === payload.id);
      const newValues = item.merge(Immutable.fromJS(payload.newValues)).set('isUpdating', false);
      return state.set(index, newValues);
    }
    case actionTypes.ITEM_UPDATE_FAILURE: {
      const [index, item] = state.findEntry(val => val.get('id') === payload.id);
      return state.set(index, item.set('isUpdating', false));
    }
    default:
      return state;
  }
}
