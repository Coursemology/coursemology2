import { AppState } from 'store';

import { CodaveriFeedbackStatus } from '../types';

const getLocalState = (state: AppState): CodaveriFeedbackStatus => {
  return state.assessments.submission.codaveriFeedbackStatus;
};

export const getCodaveriFeedbackStatus = (
  state: AppState,
): CodaveriFeedbackStatus => {
  return getLocalState(state);
};
