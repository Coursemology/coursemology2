import recorderHelper from '../../../utils/recorderHelper';
import actionTypes from '../../constants';
import recorderReducer from '../recorder';

jest.mock('../../../utils/recorderHelper', () => ({
  stopRecord: jest.fn(() => Promise.resolve()),
  isRecording: jest.fn(() => false),
}));

describe('recorder reducer', () => {
  beforeEach(() => jest.clearAllMocks());

  it('does not stop the recorder on final unmount when it is not recording', () => {
    // Unconditionally calling stopRecord() here returns a rejected promise
    // ('Recorder has already stopped') that nothing handles -> the dev error overlay.
    recorderHelper.isRecording.mockReturnValue(false);
    const state = { recorderComponentsCount: 1, recording: false };

    recorderReducer(state, { type: actionTypes.RECORDER_COMPONENT_UNMOUNT });

    expect(recorderHelper.stopRecord).not.toHaveBeenCalled();
  });

  it('stops the recorder on final unmount when it is still recording', () => {
    recorderHelper.isRecording.mockReturnValue(true);
    const state = { recorderComponentsCount: 1, recording: true };

    recorderReducer(state, { type: actionTypes.RECORDER_COMPONENT_UNMOUNT });

    expect(recorderHelper.stopRecord).toHaveBeenCalledTimes(1);
  });

  it('does not stop the recorder while other recorder components remain mounted', () => {
    recorderHelper.isRecording.mockReturnValue(true);
    const state = { recorderComponentsCount: 2, recording: true };

    recorderReducer(state, { type: actionTypes.RECORDER_COMPONENT_UNMOUNT });

    expect(recorderHelper.stopRecord).not.toHaveBeenCalled();
  });
});
