/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { AppState } from 'store';
import { selectMiniEntities } from 'utilities/store';

function getLocalState(state: AppState) {
  return state.enrolRequests;
}

export function getAllEnrolRequestEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).enrolRequests,
    getLocalState(state).enrolRequests.ids,
  );
}

export function getManageCourseUserPermissions(state: AppState) {
  return getLocalState(state).permissions;
}

export function getManageCourseUsersSharedData(state: AppState) {
  return getLocalState(state).manageCourseUsersData;
}
