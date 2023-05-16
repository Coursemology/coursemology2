/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AppState } from 'store';
import { selectMiniEntities } from 'utilities/store';

function getLocalState(state: AppState) {
  return state.invitations;
}

export function getAllInvitationsMiniEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).invitations,
    getLocalState(state).invitations.ids,
  );
}

export function getManageCourseUserPermissions(state: AppState) {
  return getLocalState(state).permissions;
}

export function getManageCourseUsersSharedData(state: AppState) {
  return getLocalState(state).manageCourseUsersData;
}

export function getCourseRegistrationKey(state: AppState) {
  return getLocalState(state).courseRegistrationKey;
}
