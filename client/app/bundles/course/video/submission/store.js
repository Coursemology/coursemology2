import { applyMiddleware, compose, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { Map as makeImmutableMap } from 'immutable';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import rootReducer, { createInitialState, persistTransforms } from './reducers';

/**
 * The state reconciler for redux-persist that is called to transform the state as deserialized from localstorage to the
 * initial redux state we desire after the restoration.
 *
 * Here, we expect the old deserialized state to contain the old video state slice, and any old session data that
 * was, for one reason or another, not yet sent to the server. We extract the old video state slice and insert it
 * into the old sessions map.
 *
 * The idea is that the video component will attempt to sync the video state slice, together with all session
 * events, with the server when the user closes the window. However, since we should not block a close action, the
 * response from the server may not always arrive in time. In such a case we move the old video state slice into the old
 * session data state slice so that it may be resent to the server. In other words, we try to catch up on session
 * data when a user revisits the video component.
 *
 * @param inboundState The state as deserialized from localstorage
 * @param _ The initial redux state before the other reducers process it (unused)
 * @param reducedState The initial redux state after it passes through the reducers
 * @return {*}
 */
const stateReconciler = (inboundState, _, reducedState) => {
  if (!inboundState) {
    return reducedState;
  }

  const inboundOldSessions = inboundState.oldSessions || makeImmutableMap();
  let oldSessions = inboundOldSessions.merge(reducedState.oldSessions);

  if (
    inboundState.video &&
    inboundState.video.sessionId &&
    !inboundState.video.sessionClosed
  ) {
    const inboundVideoState = inboundState.video;
    const inboundSessionId = inboundVideoState.sessionId;
    oldSessions = oldSessions.set(inboundSessionId, inboundVideoState);
  }

  return { ...reducedState, oldSessions };
};

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
  const storeCreator =
    process.env.NODE_ENV === 'development'
      ? compose(
          // eslint-disable-next-line global-require
          applyMiddleware(thunkMiddleware, require('redux-logger').logger)
        )(createStore)
      : compose(applyMiddleware(thunkMiddleware))(createStore);

  if (props.courseUserId && props.video.sessionId) {
    const store = storeCreator(
      persistReducer(persistConfig(props.courseUserId), rootReducer),
      initialState
    );
    const persistor = persistStore(store);
    return { store, persistor };
  }

  return { store: storeCreator(rootReducer, initialState) };
};
