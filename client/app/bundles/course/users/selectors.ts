/* eslint-disable @typescript-eslint/explicit-function-return-type */
import sharedConstants from 'lib/constants/sharedConstants';
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

export function getAllStudentMiniEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).users,
    getLocalState(state).users.ids,
  ).filter((entity) => entity.role === 'student');
}

export function getAllStaffMiniEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).users,
    getLocalState(state).users.ids,
  ).filter(
    (entity) =>
      Object.keys(sharedConstants.STAFF_ROLES).indexOf(entity.role) > -1,
  );
}

export function getAllUserOptionMiniEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).userOptions,
    getLocalState(state).userOptions.ids,
  );
}

export function getManageCourseUserPermissions(state: AppState) {
  return getLocalState(state).permissions;
}

export function getManageCourseUsersSharedData(state: AppState) {
  return getLocalState(state).manageCourseUsersData;
}

export function getAllPersonalTimesEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).personalTimes,
    getLocalState(state).personalTimes.ids,
  );
}
