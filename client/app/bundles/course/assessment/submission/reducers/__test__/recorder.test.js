import recorderHelper from '../../../utils/recorderHelper';
import actionTypes from '../../constants';
import recorderReducer from '../recorder';

jest.mock('../../../utils/recorderHelper', () => ({
  __esModule: true,
  default: {
    stopRecord: jest.fn(),
    isRecording: jest.fn(),
  },
}));

const mountedState = {
  recording: false,
  recorderComponentsCount: 1,
  recordingComponentId: '',
};

beforeEach(() => jest.clearAllMocks());

describe('recorder reducer', () => {
  describe('when the last recorder component unmounts', () => {
    it('stops the recorder if it is still recording', () => {
      recorderHelper.isRecording.mockReturnValue(true);
      recorderHelper.stopRecord.mockResolvedValue(new File([], 'a.wav'));

      recorderReducer(
        { ...mountedState, recording: true },
        { type: actionTypes.RECORDER_COMPONENT_UNMOUNT },
      );

      expect(recorderHelper.stopRecord).toHaveBeenCalled();
    });

    it('does not stop the recorder if nothing is being recorded', () => {
      recorderHelper.isRecording.mockReturnValue(false);

      recorderReducer(mountedState, {
        type: actionTypes.RECORDER_COMPONENT_UNMOUNT,
      });

      expect(recorderHelper.stopRecord).not.toHaveBeenCalled();
    });
  });

  it('does not stop the recorder while other components remain mounted', () => {
    recorderHelper.isRecording.mockReturnValue(true);

    recorderReducer(
      { ...mountedState, recording: true, recorderComponentsCount: 2 },
      { type: actionTypes.RECORDER_COMPONENT_UNMOUNT },
    );

    expect(recorderHelper.stopRecord).not.toHaveBeenCalled();
  });
});
