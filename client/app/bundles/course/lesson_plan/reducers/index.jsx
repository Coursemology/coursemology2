import lessonPlanReducer, { initialState as lessonPlanInitialState } from './lessonPlanReducer';

// Redux expects to initialize the store using an Object, not an Immutable.Map
export const initialStates = {
  lessonPlan: lessonPlanInitialState,
};

export default {
  lessonPlan: lessonPlanReducer,
};
