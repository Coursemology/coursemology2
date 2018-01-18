import { Map as makeImmutableMap } from 'immutable';

export const initialState = makeImmutableMap();

export default function (state = initialState) {
  return state;
}
