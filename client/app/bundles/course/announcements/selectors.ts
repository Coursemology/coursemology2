/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AnnouncementPermissions } from 'types/course/announcements';
import { AppState, SelectionKey } from 'types/store';
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

export function getAnnouncementPermissions(state: AppState) {
  return getLocalState(state).permissions as AnnouncementPermissions;
}
