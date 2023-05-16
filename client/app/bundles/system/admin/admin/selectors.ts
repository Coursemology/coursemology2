/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AppState } from 'store';
import { selectMiniEntities } from 'utilities/store';

function getLocalState(state: AppState) {
  return state.admin;
}

export function getAllAnnouncementMiniEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).announcements,
    getLocalState(state).announcements.ids,
  );
}

export function getAllUserMiniEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).users,
    getLocalState(state).users.ids,
  );
}

export function getAdminCounts(state: AppState) {
  return getLocalState(state).counts;
}

export function getAllCourseMiniEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).courses,
    getLocalState(state).courses.ids,
  );
}

export function getAllInstanceMiniEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).instances,
    getLocalState(state).instances.ids,
  );
}

export function getPermissions(state: AppState) {
  return getLocalState(state).permissions;
}
