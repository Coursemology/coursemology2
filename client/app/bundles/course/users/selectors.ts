/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AppState } from 'store';
import { COURSE_STAFF_ROLES } from 'types/course/courseUsers';
import { SelectionKey } from 'types/store';
import {
  selectEntity,
  selectMiniEntities,
  selectMiniEntity,
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
      COURSE_STAFF_ROLES.findIndex((role) => role === entity.role) >= 0,
  );
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
