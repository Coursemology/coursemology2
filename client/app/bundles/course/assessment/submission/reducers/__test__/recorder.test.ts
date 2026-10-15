import recorderHelper from '../../../utils/recorderHelper';
import actionTypes from '../../constants';
import reducer from '../recorder';

jest.mock('../../../utils/recorderHelper');

describe('recorder reducer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('RECORDER_COMPONENT_UNMOUNT', () => {
    it('does not try to stop the recorder when nothing was recording', () => {
      recorderHelper.isRecording.mockReturnValue(false);
      const state = {
        recording: false,
        recorderComponentsCount: 1,
        recordingComponentId: '',
      };

      reducer(state, { type: actionTypes.RECORDER_COMPONENT_UNMOUNT });

      expect(recorderHelper.stopRecord).not.toHaveBeenCalled();
    });

    it('stops the recorder when the user navigates away mid-recording', () => {
      recorderHelper.isRecording.mockReturnValue(true);
      recorderHelper.stopRecord.mockResolvedValue(new File([], 'test.wav'));
      const state = {
        recording: true,
        recorderComponentsCount: 1,
        recordingComponentId: 'voice_response_1',
      };

      reducer(state, { type: actionTypes.RECORDER_COMPONENT_UNMOUNT });

      expect(recorderHelper.stopRecord).toHaveBeenCalled();
    });

    it('does not decrement below the last unmount and resets recording state', () => {
      recorderHelper.isRecording.mockReturnValue(false);
      const state = {
        recording: true,
        recorderComponentsCount: 1,
        recordingComponentId: 'voice_response_1',
      };

      const nextState = reducer(state, {
        type: actionTypes.RECORDER_COMPONENT_UNMOUNT,
      });

      expect(nextState).toEqual({
        recording: false,
        recorderComponentsCount: 0,
        recordingComponentId: 'voice_response_1',
      });
    });
  });
});
