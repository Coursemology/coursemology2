import { notificationActionTypes } from 'lib/constants/videoConstants';

export const initialState = {};

export default function(state = initialState, action) {
  switch (action.type) {
    case notificationActionTypes.SET_NOTIFICATION: {
      return { message: action.message };
    }
    default:
      return state;
  }
}
