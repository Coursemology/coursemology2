/* eslint-disable @typescript-eslint/explicit-function-return-type */
import {
  ManageCourseUsersPermissions,
  ManageCourseUsersTabData,
} from 'types/course/courseUsers';
import { AppState } from 'types/store';
import { selectEntities } from 'utilities/store';

function getLocalState(state: AppState) {
  return state.invitations;
}

export function getAllInvitationsEntities(state: AppState) {
  return selectEntities(
    getLocalState(state).invitations,
    getLocalState(state).invitations.ids,
  );
}

export function getManageCourseUserPermissions(state: AppState) {
  return getLocalState(state).permissions as ManageCourseUsersPermissions;
}

export function getManageCourseUsersTabData(state: AppState) {
  return getLocalState(state).manageCourseUsersData as ManageCourseUsersTabData;
}

export function getCourseRegistrationKey(state: AppState) {
  return getLocalState(state).courseRegistrationKey;
}
