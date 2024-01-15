import { AppState } from 'store';

const getLocalState = (state: AppState): Record<number | string, number> => {
  return state.assessments.submission.answers.clientVersionByAnswerId;
};

export const getClientVersionForAnswerId = (
  state: AppState,
  answerId: number,
): number => {
  return getLocalState(state)[answerId];
};
