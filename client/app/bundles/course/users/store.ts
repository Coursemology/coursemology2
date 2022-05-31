import { enableMapSet } from 'immer';
import { applyMiddleware, createStore, compose, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import usersReducer from './reducers';

const defaultReducers = {};

const rootReducer = combineReducers({
  users: usersReducer,
});

enableMapSet();

export default function configureStore(): any {
  const storeCreator: any =
    // @ts-ignore: ignore ts warning for process
    process.env.NODE_ENV === 'development'
      ? compose(
          /* eslint-disable-next-line global-require, import/no-extraneous-dependencies */ // @ts-ignore: ignore ts warning for require
          applyMiddleware(thunkMiddleware, require('redux-logger').logger),
        )(createStore)
      : compose(applyMiddleware(thunkMiddleware))(createStore);
  return storeCreator(rootReducer, defaultReducers);
}
