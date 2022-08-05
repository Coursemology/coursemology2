/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AppState } from 'types/store';
import { selectMiniEntities } from 'utilities/store';

function getLocalState(state: AppState) {
  return state.instanceAdmin;
}

export function getInstance(state: AppState) {
  return getLocalState(state).instance;
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

export function getAllInvitationMiniEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).invitations,
    getLocalState(state).invitations.ids,
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

export function getAllComponentsMiniEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).components,
    getLocalState(state).components.ids,
  );
}

export function getAllRoleRequestsMiniEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).roleRequests,
    getLocalState(state).roleRequests.ids,
  );
}
