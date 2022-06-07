/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { CourseUsersPermissions } from 'types/course/course_users';
import { AppState, SelectionKey } from 'types/store';
import {
  selectMiniEntity,
  selectMiniEntities,
  selectEntity,
  selectEntities,
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

export function getAllUserMiniEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).users,
    getLocalState(state).users.ids,
  );
}

export function getAllStudentsEntities(state: AppState) {
  return selectEntities(
    getLocalState(state).users,
    getLocalState(state).users.ids,
  ).filter((entity) => entity.role === 'student');
}

export function getAllStaffEntities(state: AppState) {
  return selectEntities(
    getLocalState(state).users,
    getLocalState(state).users.ids,
  ).filter((entity) => entity.role !== 'student');
}


export function getCourseUserPermissions(state: AppState) {
  return getLocalState(state).permissions as CourseUsersPermissions;
}
