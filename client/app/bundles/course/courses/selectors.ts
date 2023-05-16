/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AppState } from 'store';
import { SelectionKey } from 'types/store';
import { selectEntity, selectMiniEntities } from 'utilities/store';

function getLocalState(state: AppState) {
  return state.courses;
}

export function getCourseEntity(state: AppState, id: SelectionKey) {
  return selectEntity(getLocalState(state).courses, id);
}

export function getAllCourseMiniEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).courses,
    getLocalState(state).courses.ids,
  );
}

export function getCoursePermissions(state: AppState) {
  return getLocalState(state).permissions;
}

export function getCourseInstanceUserRoleRequest(state: AppState) {
  return getLocalState(state).instanceUserRoleRequest;
}
