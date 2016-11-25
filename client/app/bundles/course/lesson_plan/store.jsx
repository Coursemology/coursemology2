import { compose, createStore, applyMiddleware, combineReducers } from 'redux';

// Import thunkMiddleware for asynchronous actions
import thunkMiddleware from 'redux-thunk';

import reducers, { initialStates } from './reducers';

export default (props) => {
  const { lessonPlan } = initialStates;

  const initialState = {
    lessonPlan: lessonPlan.merge(props),
  };

  const reducer = combineReducers(reducers);

  const storeCreator = compose(
    applyMiddleware(thunkMiddleware)
  )(createStore);

  return storeCreator(reducer, initialState);
};
