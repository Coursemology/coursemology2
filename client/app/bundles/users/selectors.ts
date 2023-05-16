/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AppState } from 'store';
import { selectMiniEntities } from 'utilities/store';

function getLocalState(state: AppState) {
  return state.global.user;
}

export function getUserEntity(state: AppState) {
  return getLocalState(state).user;
}

export function getAllCurrentCourseMiniEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).currentCourses,
    getLocalState(state).currentCourses.ids,
  );
}

export function getAllCompletedCourseMiniEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).completedCourses,
    getLocalState(state).completedCourses.ids,
  );
}

export function getAllInstanceMiniEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).instances,
    getLocalState(state).instances.ids,
  );
}
