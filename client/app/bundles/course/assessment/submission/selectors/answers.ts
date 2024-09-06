import { Dictionary } from '@reduxjs/toolkit';
import { AppState } from 'store';

import { SAVING_STATUS } from 'lib/constants/sharedConstants';

import { AnswerFlagData } from '../reducers/answerFlags';

const getLocalState = (state: AppState): Record<number | string, number> => {
  return state.assessments.submission.answers.clientVersionByAnswerId;
};

const getSavingStatus = (state: AppState): Dictionary<AnswerFlagData> => {
  return state.assessments.submission.answerFlags.flagsByAnswerId.entities;
};

export const getClientVersionForAnswerId = (
  state: AppState,
  answerId: number,
): number => {
  return getLocalState(state)[answerId];
};

export const getSavingStatusForAnswerId = (
  state: AppState,
  answerId: number,
): keyof typeof SAVING_STATUS => {
  return getSavingStatus(state)[answerId]?.savingStatus ?? SAVING_STATUS.None;
};
