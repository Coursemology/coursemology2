import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import rootReducer from './reducers';

function generateStore() {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line global-require
    return createStore(rootReducer, applyMiddleware(thunkMiddleware, require('redux-logger').logger));
  }
  return createStore(rootReducer, applyMiddleware(thunkMiddleware));
}

const store = generateStore();
export default store;
