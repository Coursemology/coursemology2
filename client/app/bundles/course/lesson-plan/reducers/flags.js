import actionTypes from '../constants';

const initialState = {
  canManageLessonPlan: false,
};

export default function (state = initialState, action) {
  const { type } = action;

  switch (type) {
    case actionTypes.LOAD_LESSON_PLAN_SUCCESS: {
      return { ...state, ...action.flags };
    }
    default:
      return state;
  }
}
