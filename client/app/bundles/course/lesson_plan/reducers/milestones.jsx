import Immutable from 'immutable';

export const initialState = Immutable.fromJS([]);

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    default:
      return state;
  }
}
