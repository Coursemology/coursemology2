import { List as makeImmutableList, Map as makeImmutableMap } from 'immutable';
import { createTransform } from 'redux-persist';
import { sessionActionTypes } from 'lib/constants/videoConstants';

/**
 * oldSessions state slice is an ImmutableMap mapping a old session id to a old video state slice.
 *
 * Refer to the video reducer for the format of the video state slice.
 *
 * This reducer does not deal with the population of the old sessions; that is done by redux-persist using the
 * stateReconciler() in store.js. Once populated, old sessions are immutable individually, but may be removed by the
 * reducer function as below.
 */
export const initialState = makeImmutableMap();

export const persistTransform = createTransform(
  inboundState => inboundState.toJS(),
  outboundState => makeImmutableMap(outboundState).map(videoState => ({
    ...videoState,
    sessionEvents: makeImmutableList(videoState.sessionEvents),
  })),
  { whitelist: ['oldSessions'] }
);

function removeSessionIds(oldSessionsMap, sessionIdsArray) {
  let oldSessionsMapFiltered = oldSessionsMap;
  sessionIdsArray.forEach((id) => {
    oldSessionsMapFiltered = oldSessionsMapFiltered.delete(id);
  });

  return oldSessionsMapFiltered;
}

export default function (state = initialState, action) {
  switch (action.type) {
    case sessionActionTypes.REMOVE_OLD_SESSIONS:
      return removeSessionIds(state, action.sessionIds);
    default:
      return state;
  }
}
