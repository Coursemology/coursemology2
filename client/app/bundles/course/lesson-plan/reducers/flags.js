import actionTypes, { columns } from '../constants';

export const initialState = {
  canManageLessonPlan: false,
  milestonesExpanded: 'current',
  editPageColumnsVisible: {
    [columns.ITEM_TYPE]: true,
    [columns.START_AT]: true,
    [columns.BONUS_END_AT]: true,
    [columns.END_AT]: true,
    [columns.PUBLISHED]: true,
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
