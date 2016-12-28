import Immutable from 'immutable';
import { combineReducers } from 'redux-immutable';
import lessonPlanReducer, { initialState as lessonPlanInitialState } from './lessonPlanReducer';

// Redux expects to initialize the store using an Object, not an Immutable.Map
export const initialStates = Immutable.fromJS({
  lessonPlan: lessonPlanInitialState,
});

export default combineReducers({
  lessonPlan: lessonPlanReducer,
});
