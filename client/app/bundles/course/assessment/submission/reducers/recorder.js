import recorderHelper from '../../utils/recorderHelper';
import actionTypes from '../constants';

const initialState = {
  recording: false,
  recorderComponentsCount: 0,
  recordingComponentId: '',
};

export default function (state = initialState, action) {
  switch (action.type) {
    case actionTypes.RECORDER_SET_RECORDING: {
      const { recordingComponentId } = action.payload || {};
      return {
        ...state,
        recording: true,
        recordingComponentId,
      };
    }
    case actionTypes.RECORDER_SET_UNRECORDING: {
      return {
        ...state,
        recording: false,
        recordingComponentId: '',
      };
    }
    case actionTypes.RECORDER_COMPONENT_MOUNT: {
      let { recorderComponentsCount = 0 } = state;
      recorderComponentsCount += 1;
      return {
        ...state,
        recorderComponentsCount,
      };
    }
    case actionTypes.RECORDER_COMPONENT_UNMOUNT: {
      let { recorderComponentsCount = 0, recording } = state;
      recorderComponentsCount -= 1;
      recording = false;

      /**
       * When the user navigates to another path without stopping the recorder,
       * help them stop it — but only if it was actually recording. Otherwise
       * stopRecord() rejects with "Recorder has already stopped", and since
       * nothing here awaits the promise, that becomes an unhandled rejection
       * (surfaces as a full-page crash under React 18 StrictMode's dev-only
       * double mount/unmount, since it fires on every unrecorded Voice question).
       */
      if (recorderComponentsCount === 0 && recorderHelper.isRecording()) {
        recorderHelper.stopRecord().catch(() => {});
      }
      return {
        ...state,
        recorderComponentsCount,
        recording,
      };
    }
    default:
      return state;
  }
}
