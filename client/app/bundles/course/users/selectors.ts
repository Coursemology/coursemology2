/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AppState } from 'store';
import { SelectionKey } from 'types/store';
import {
  selectEntity,
  selectMiniEntities,
  selectMiniEntity,
} from 'utilities/store';

import { STAFF_ROLES } from 'lib/constants/sharedConstants';

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
  ).filter((entity) => Object.keys(STAFF_ROLES).indexOf(entity.role) > -1);
}

export function getAllUserOptionMiniEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).userOptions,
    getLocalState(state).userOptions.ids,
  );
}

export function getStudentOptionMiniEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).userOptions,
    getLocalState(state).userOptions.ids,
  ).filter((entity) => entity.role === 'student');
}

export function getAssignableTimelines(state: AppState) {
  return getLocalState(state).timelines;
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

export function getAllExperiencePointsRecordsEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).experiencePointsRecords,
    getLocalState(state).experiencePointsRecords.ids,
  );
}

export function getExperiencePointsRecordsSettings(state: AppState) {
  return getLocalState(state).experiencePointsRecordsSettings;
}
