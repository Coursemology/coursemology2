import { compose, createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import rootReducer from './reducers';

export default ({ surveys }) => {
  const initialStates = surveys;
  const storeCreator = (process.env.NODE_ENV === 'development') ?
    compose(applyMiddleware(thunkMiddleware, require('redux-logger').logger))(createStore) : // eslint-disable-line global-require
    compose(applyMiddleware(thunkMiddleware))(createStore);

  return storeCreator(rootReducer, initialStates);
};
