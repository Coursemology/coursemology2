import actionTypes from '../constants';

const initialState = [];

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.LESSON_PLAN_ITEM_SETTING_UPDATE_SUCCESS:
      return action.updatedSettings;
    default:
      return state;
  }
}
