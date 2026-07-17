import recorderHelper from '../../../utils/recorderHelper';
import actionTypes from '../../constants';
import reducer from '../recorder';

jest.mock('../../../utils/recorderHelper', () => ({
  isRecording: jest.fn(),
  stopRecord: jest.fn(),
}));

describe('recorder reducer', () => {
  beforeEach(() => {
    recorderHelper.isRecording.mockReset();
    recorderHelper.stopRecord.mockReset();
  });

  it('does not stop the recorder when the last component unmounts and nothing is recording', () => {
    recorderHelper.isRecording.mockReturnValue(false);
    const state = { recorderComponentsCount: 1, recording: false };

    const nextState = reducer(state, {
      type: actionTypes.RECORDER_COMPONENT_UNMOUNT,
    });

    expect(recorderHelper.stopRecord).not.toHaveBeenCalled();
    expect(nextState).toMatchObject({
      recorderComponentsCount: 0,
      recording: false,
    });
  });

  it('stops the recorder when the last component unmounts during an active recording', () => {
    recorderHelper.isRecording.mockReturnValue(true);
    const state = { recorderComponentsCount: 1, recording: true };

    const nextState = reducer(state, {
      type: actionTypes.RECORDER_COMPONENT_UNMOUNT,
    });

    expect(recorderHelper.stopRecord).toHaveBeenCalledTimes(1);
    expect(nextState).toMatchObject({
      recorderComponentsCount: 0,
      recording: false,
    });
  });
});
