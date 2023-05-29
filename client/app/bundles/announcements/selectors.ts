/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AppState } from 'store';
import { selectMiniEntities } from 'utilities/store';

function getLocalState(state: AppState) {
  return state.global.announcements;
}

export function getAllAnnouncementMiniEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).announcements,
    getLocalState(state).announcements.ids,
  );
}
