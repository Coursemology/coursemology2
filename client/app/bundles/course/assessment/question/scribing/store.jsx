import { compose, createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import rootReducer, { initialStates } from './reducers';

export default () => {
  const storeCreator = compose(
    applyMiddleware(thunkMiddleware)
  )(createStore);

  return storeCreator(rootReducer, initialStates);
};
