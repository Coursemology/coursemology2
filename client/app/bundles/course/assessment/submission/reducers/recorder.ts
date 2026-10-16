// Which voice-response question, if any, is recording. Only one take is captured at a time across the
// page, so every question reads this to disable its Start button while another question records.
//
// The recording itself (the mic stream, the take in progress) lives in utils/recorderHelper rather than
// here: neither is serialisable. Cleanup when a question unmounts mid-take is done by the question's
// useVoiceRecorder hook, which keeps this reducer free of side effects.
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface RecorderState {
  recording: boolean;
  // Identifies the recording question, as `voice_response_<question id>`; empty when nothing records.
  recordingComponentId: string;
}

const initialState: RecorderState = {
  recording: false,
  recordingComponentId: '',
};

export const recorderSlice = createSlice({
  name: 'recorder',
  initialState,
  reducers: {
    setRecording: (
      state,
      action: PayloadAction<{ recordingComponentId: string }>,
    ) => {
      state.recording = true;
      state.recordingComponentId = action.payload.recordingComponentId;
    },
    setNotRecording: (state) => {
      state.recording = false;
      state.recordingComponentId = '';
    },
  },
});

export const { setRecording, setNotRecording } = recorderSlice.actions;

export default recorderSlice.reducer;
