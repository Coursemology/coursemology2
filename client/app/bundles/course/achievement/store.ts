import { enableMapSet } from 'immer';
import {
  applyMiddleware,
  createStore,
  compose,
  combineReducers,
  Reducer,
} from 'redux';
import thunkMiddleware from 'redux-thunk';
import achievementReducer from './reducers';

const defaultReducers = {};

const rootReducer: Reducer<{}> = combineReducers<{}>({
  achievements: achievementReducer,
});

enableMapSet();

export default function configureStore() {
  const storeCreator: any =
    process.env.NODE_ENV === 'development'
      ? compose(
          /* eslint-disable-next-line global-require, import/no-extraneous-dependencies */
          applyMiddleware(thunkMiddleware, require('redux-logger').logger),
        )(createStore)
      : compose(applyMiddleware(thunkMiddleware))(createStore);
  return storeCreator(rootReducer, defaultReducers);
}
