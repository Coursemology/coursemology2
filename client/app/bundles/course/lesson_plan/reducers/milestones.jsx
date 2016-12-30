import Immutable from 'immutable';
import actionTypes from '../constants';

export const initialState = Immutable.fromJS([]);

export default function (state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case actionTypes.SET_MILESTONE_FIELD: {
      const { id, field, value } = payload;
      const [index, milestone] = state.findEntry(val => val.get('id') === id);
      return state.set(index, milestone.set(field, value));
    }
    default:
      return state;
  }
}
