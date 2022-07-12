/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AppState } from 'types/store';
import { selectMiniEntities } from 'utilities/store';
import { SubmissionPermissions } from 'types/course/assessment/submissions';

function getLocalState(state: AppState) {
  return state.submissions;
}

export function getAllSubmissionMiniEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).submissions,
    getLocalState(state).submissions.ids,
  );
}

export function getIsGamified(state: AppState) {
  return getLocalState(state).metaData.isGamified;
}

export function getSubmissionCount(state: AppState) {
  return getLocalState(state).metaData.submissionCount;
}

export function getTabs(state: AppState) {
  return getLocalState(state).metaData.tabs;
}

export function getFilter(state: AppState) {
  return getLocalState(state).metaData.filter;
}

export function getSubmissionPermissions(state: AppState) {
  return getLocalState(state).permissions as SubmissionPermissions;
}
