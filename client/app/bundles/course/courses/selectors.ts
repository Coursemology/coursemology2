/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { CoursePermissions } from 'types/course/courses';
import { AppState } from 'types/store';
import { selectMiniEntities } from 'utilities/store';

function getLocalState(state: AppState) {
  return state.courses;
}

export function getAllCourseMiniEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).courses,
    getLocalState(state).courses.ids,
  );
}

export function getCoursePermissions(state: AppState) {
  return getLocalState(state).permissions as CoursePermissions;
}

export function getCourseInstanceUserRoleRequest(state: AppState) {
  return getLocalState(state).instanceUserRoleRequestId as number;
}
