/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { CoursesPermissions } from 'types/course/courses';
import { AppState } from 'types/store';
import { selectMiniEntities } from 'utilities/store';

function getLocalState(state: AppState) {
  return state.courses;
}

export function getAllCoursesMiniEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).courses,
    getLocalState(state).courses.ids,
  );
}

export function getCoursesPermissions(state: AppState) {
  return getLocalState(state).permissions as CoursesPermissions;
}
