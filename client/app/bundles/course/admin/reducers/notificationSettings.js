import actionTypes from '../constants';

const initialState = [];

export default function(state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.NOTIFICATION_SETTING_UPDATE_SUCCESS:
      return action.updatedSettings;
    default:
      return state;
  }
}
