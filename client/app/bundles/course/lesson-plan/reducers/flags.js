import actionTypes, { fields } from '../constants';

export const initialState = {
  canManageLessonPlan: false,
  milestonesExpanded: 'current',
  editPageColumnsVisible: {
    [fields.ITEM_TYPE]: true,
    [fields.START_AT]: true,
    [fields.BONUS_END_AT]: true,
    [fields.END_AT]: true,
    [fields.PUBLISHED]: true,
  },
};

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.LOAD_LESSON_PLAN_SUCCESS: {
      const nextState = { ...state, ...action.flags };
      if (!nextState.milestonesExpanded) {
        nextState.milestonesExpanded = initialState.milestonesExpanded;
      }
      return nextState;
    }
    default:
      return state;
  }
}
