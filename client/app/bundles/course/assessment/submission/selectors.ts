/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AppState } from 'store';

function getLocalState(state: AppState) {
  return state.assessments.submission;
}

export function getSavingStatus(state: AppState) {
  return getLocalState(state).submissionFlags.savingStatus;
}
