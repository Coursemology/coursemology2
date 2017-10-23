import { compose, createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import rootReducer from './reducers';

export default ({ announcements }) => {
  const initialStates = announcements;
  const storeCreator = (process.env.NODE_ENV === 'development') ?
    // eslint-disable-next-line global-require
    compose(applyMiddleware(thunkMiddleware, require('redux-logger').logger))(createStore) :
    compose(applyMiddleware(thunkMiddleware))(createStore);

  return storeCreator(rootReducer, initialStates);
};
