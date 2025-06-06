import {
  createEntityAdapter,
  createSlice,
  type EntityState,
  PayloadAction,
} from '@reduxjs/toolkit';

import { SAVING_STATUS } from 'lib/constants/sharedConstants';

export const answerFlagsAdapter = createEntityAdapter<AnswerFlagData>({});

export interface AnswerFlagData {
  id: string | number;
  savingStatus: keyof typeof SAVING_STATUS;
  savingSize: number;
  clientVersion: number | null | undefined;
}

export interface AnswerFlagsState {
  flagsByAnswerId: EntityState<AnswerFlagData>;
}

const initialState: AnswerFlagsState = {
  flagsByAnswerId: answerFlagsAdapter.getInitialState(),
};

export const answerFlagsSlice = createSlice({
  name: 'answerFlags',
  initialState,
  reducers: {
    initiateAnswerFlagsForAnswers: (
      state,
      action: PayloadAction<{
        answers: { id: string | number; clientVersion: number }[];
      }>,
    ) => {
      const { answers } = action.payload;
      answerFlagsAdapter.removeAll(state.flagsByAnswerId);
      answers.forEach((answer) => {
        answerFlagsAdapter.setOne(state.flagsByAnswerId, {
          id: answer.id,
          savingStatus: SAVING_STATUS.None,
          savingSize: 0,
          clientVersion: answer.clientVersion,
        });
      });
    },
    resetExistingAnswerFlags: (state, _action: PayloadAction) => {
      state.flagsByAnswerId.ids.forEach((answerId) => {
        answerFlagsAdapter.updateOne(state.flagsByAnswerId, {
          id: answerId,
          changes: {
            savingStatus: SAVING_STATUS.None,
            savingSize: 0,
          },
        });
      });
    },
    updateAnswerFlagSavingSize: (
      state,
      action: PayloadAction<{
        answer: { id: number | string };
        savingSize: AnswerFlagData['savingSize'];
        isStaleAnswer?: boolean;
      }>,
    ) => {
      if (action.payload.isStaleAnswer) return;
      answerFlagsAdapter.updateOne(state.flagsByAnswerId, {
        id: action.payload.answer.id,
        changes: {
          savingSize: action.payload.savingSize,
        },
      });
    },
    updateAnswerFlagSavingStatus: (
      state,
      action: PayloadAction<{
        answer: { id: number | string };
        savingStatus: AnswerFlagData['savingStatus'];
        isStaleAnswer?: boolean;
      }>,
    ) => {
      if (action.payload.isStaleAnswer) return;
      answerFlagsAdapter.updateOne(state.flagsByAnswerId, {
        id: action.payload.answer.id,
        changes: {
          savingStatus: action.payload.savingStatus,
        },
      });
    },
  },
});

export const {
  initiateAnswerFlagsForAnswers,
  resetExistingAnswerFlags,
  updateAnswerFlagSavingSize,
  updateAnswerFlagSavingStatus,
} = answerFlagsSlice.actions;

export default answerFlagsSlice.reducer;
