import { applyMiddleware, compose, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage'
import rootReducer, { createInitialState } from './reducers';

function persistConfig(courseUserId) {
  return {
    key: `user-${courseUserId}`,
    keyPrefix: 'persist:videoWatchSessionStore:',
    storage,
    stateReconciler,
    transforms: persistTransforms,
    whitelist: ['video', 'oldSessions'],
  };
}

export default (props) => {
  const initialState = createInitialState(props);
  const storeCreator = (process.env.NODE_ENV === 'development') ?
    // eslint-disable-next-line global-require
    compose(applyMiddleware(thunkMiddleware, require('redux-logger').logger))(createStore) :
    compose(applyMiddleware(thunkMiddleware))(createStore);

  if (props.courseUserId && props.video.sessionId) {
    const store = storeCreator(persistReducer(persistConfig(props.courseUserId), rootReducer), initialState);
    const persistor = persistStore(store);
    return { store, persistor };
  }

  return { store: storeCreator(rootReducer, initialState) };
};
