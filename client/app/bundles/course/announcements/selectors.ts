/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AppState } from 'store';
import { SelectionKey } from 'types/store';
import { selectMiniEntities, selectMiniEntity } from 'utilities/store';

function getLocalState(state: AppState) {
  return state.announcements;
}

export function getAnnouncementMiniEntity(state: AppState, id: SelectionKey) {
  return selectMiniEntity(getLocalState(state).announcements, id);
}

export function getAllAnnouncementMiniEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).announcements,
    getLocalState(state).announcements.ids,
  );
}

export function getAnnouncementTitle(state: AppState) {
  return getLocalState(state).announcementTitle;
}

export function getAnnouncementPermissions(state: AppState) {
  return getLocalState(state).permissions;
}
