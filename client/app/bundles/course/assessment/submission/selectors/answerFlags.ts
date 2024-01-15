import { EntityState } from '@reduxjs/toolkit';
import { AppState } from 'store';

import { SAVING_STATUS } from 'lib/constants/sharedConstants';

import { AnswerFlagData, answerFlagsAdapter } from '../reducers/answerFlags';

const getLocalState = (state: AppState): EntityState<AnswerFlagData> => {
  return state.assessments.submission.answerFlags.flagsByAnswerId;
};

const answerFlagsSelector =
  answerFlagsAdapter.getSelectors<AppState>(getLocalState);

export const getFlagForAnswerId = (
  state: AppState,
  answerId: number,
): AnswerFlagData | undefined => {
  return answerFlagsSelector.selectById(state, answerId);
};

export const getIsSavingAnswer = (
  state: AppState,
  answerId: number,
): boolean => {
  const flag = getFlagForAnswerId(state, answerId);
  return flag?.savingStatus === SAVING_STATUS.Saving;
};
