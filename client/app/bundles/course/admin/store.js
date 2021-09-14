import { compose, createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import rootReducer from './reducers';

export default ({ admin }) => {
  const initialStates = admin;
  const storeCreator =
    process.env.NODE_ENV === 'development'
      ? compose(
          // eslint-disable-next-line global-require
          applyMiddleware(thunkMiddleware, require('redux-logger').logger)
        )(createStore)
      : compose(applyMiddleware(thunkMiddleware))(createStore);

  return storeCreator(rootReducer, initialStates);
};
