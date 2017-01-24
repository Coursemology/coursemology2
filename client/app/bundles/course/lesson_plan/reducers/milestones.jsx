import Immutable from 'immutable';
import actionTypes from '../constants';

export const initialState = Immutable.fromJS([]);

export default function (state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case actionTypes.MILESTONE_UPDATE_REQUEST: {
      const [index, milestone] = state.findEntry(val => val.get('id') === payload.id);
      return state.set(index, milestone.set('isUpdating', true));
    }
    case actionTypes.MILESTONE_UPDATE_SUCCESS: {
      const [index, milestone] = state.findEntry(val => val.get('id') === payload.id);
      const newValues = milestone.merge(Immutable.fromJS(payload.newValues)).set('isUpdating', false);
      return state.set(index, newValues);
    }
    case actionTypes.MILESTONE_UPDATE_FAILURE: {
      const [index, milestone] = state.findEntry(val => val.get('id') === payload.id);
      return state.set(index, milestone.set('isUpdating', false));
    }
    default:
      return state;
  }
}
