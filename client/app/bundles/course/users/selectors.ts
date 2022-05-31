/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AppState, SelectionKey } from 'types/store';
import {
  selectMiniEntity,
  selectMiniEntities,
  selectEntity,
} from 'utilities/store';

function getLocalState(state: AppState) {
  return state.users;
}

export function getUserMiniEntity(state: AppState, id: SelectionKey) {
  return selectMiniEntity(getLocalState(state).users, id);
}

export function getUserEntity(state: AppState, id: SelectionKey) {
  return selectEntity(getLocalState(state).users, id);
}

export function getAllUserMiniEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).users,
    getLocalState(state).users.ids,
  );
}
