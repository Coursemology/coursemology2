import actionTypes from '../constants';

export const initialState = {
  canManageLessonPlan: false,
  milestonesExpanded: 'current',
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
