import actionTypes from '../constants';
import recorderHelper from '../../utils/recorderHelper';

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
       * When the user navigate to other path without stopping the recorder
       * We need to help the user to stop
       */
      if (recorderComponentsCount === 0) {
        recorderHelper.stopRecord();
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
