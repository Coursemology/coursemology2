import actionTypes from 'lib/constants';

const initialState = {
  open: false,
  onConfirm: () => {},
};

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.SHOW_DELETE_CONFIRMATION: {
      return { open: true, onConfirm: action.onConfirm };
    }
    case actionTypes.RESET_DELETE_CONFIRMATION: {
      return { open: false, onConfirm: () => {} };
    }
    default:
      return state;
  }
}
