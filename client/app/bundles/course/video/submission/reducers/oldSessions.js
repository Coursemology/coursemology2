import { List as makeImmutableList, Map as makeImmutableMap } from 'immutable';
import { createTransform } from 'redux-persist';

/**
 * oldSessions state slice is an ImmutableMap mapping a old session id to a old video state slice.
 *
 * Refer to the video reducer for the format of the video state slice.
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

export default function (state = initialState) {
  return state;
}
