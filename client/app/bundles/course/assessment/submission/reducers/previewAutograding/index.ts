import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { PreviewAutogradingState } from '../../types';

const initialState: PreviewAutogradingState = {
  jobUrl: null,
  status: 'idle',
};

export const previewAutogradingSlice = createSlice({
  name: 'previewAutograding',
  initialState,
  reducers: {
    previewAutogradingStarted: (
      state,
      action: PayloadAction<{ jobUrl: string }>,
    ) => {
      state.jobUrl = action.payload.jobUrl;
      state.status = 'polling';
    },
    // The job finished and the submission has been refetched; the banner has nothing left to say.
    previewAutogradingSettled: (state) => {
      state.jobUrl = null;
      state.status = 'idle';
    },
    // The job errored or outlived the poll window. The url is dropped (nothing left to poll) but the
    // status persists, so the banner can keep telling the previewer to refresh.
    previewAutogradingFailed: (state) => {
      state.jobUrl = null;
      state.status = 'failed';
    },
    // The sandbox content this attempt lived in was purged mid-session: an admin permanently deleted
    // an orphaned marketplace listing, which destroys its snapshot assessments and cascades their
    // submissions. Deliberately distinct from `failed` — there is nothing left to refresh back into,
    // so the banner must not tell the previewer to refresh.
    previewAutogradingSandboxGone: (state) => {
      state.jobUrl = null;
      state.status = 'gone';
    },
  },
});

export const {
  previewAutogradingFailed,
  previewAutogradingSandboxGone,
  previewAutogradingSettled,
  previewAutogradingStarted,
} = previewAutogradingSlice.actions;

export default previewAutogradingSlice.reducer;
