import reducer, { setNotRecording, setRecording } from '../recorder';

describe('recorder reducer', () => {
  it('starts with nothing recording', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual({
      recording: false,
      recordingComponentId: '',
    });
  });

  it('records which question started recording', () => {
    const state = reducer(
      undefined,
      setRecording({ recordingComponentId: 'voice_response_3' }),
    );

    expect(state).toEqual({
      recording: true,
      recordingComponentId: 'voice_response_3',
    });
  });

  it('clears the recording question when recording stops', () => {
    const recording = reducer(
      undefined,
      setRecording({ recordingComponentId: 'voice_response_3' }),
    );

    expect(reducer(recording, setNotRecording())).toEqual({
      recording: false,
      recordingComponentId: '',
    });
  });
});
