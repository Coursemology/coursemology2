import { useEffect, useRef, useSyncExternalStore } from 'react';

import { useAppDispatch, useAppSelector } from 'lib/hooks/store';

import recorderHelper, {
  MicrophoneError,
} from '../../../../utils/recorderHelper';
import { setNotRecording, setRecording } from '../../../reducers/recorder';

interface VoiceRecorder {
  // Some question on the page is recording; only one may record at a time.
  isRecording: boolean;
  // This question is the one recording.
  isRecordingHere: boolean;
  microphoneError: MicrophoneError | null;
  onStartRecord: () => void;
  onStopRecord: (onRecorded: (file: File) => void) => void;
}

// The only place a voice-response question touches the recorder's redux state.
const useVoiceRecorder = (questionId: number): VoiceRecorder => {
  const dispatch = useAppDispatch();
  const recordingComponentId = `voice_response_${questionId}`;

  const isRecording = useAppSelector(
    (state) => state.assessments.submission.recorder.recording,
  );
  const recordingId = useAppSelector(
    (state) => state.assessments.submission.recorder.recordingComponentId,
  );
  const isRecordingHere = isRecording && recordingId === recordingComponentId;

  const microphoneError = useSyncExternalStore(
    recorderHelper.subscribeToMicrophoneError,
    recorderHelper.getMicrophoneError,
  );

  // Read at unmount, so it must hold the latest value rather than the one from the first render.
  const isRecordingHereRef = useRef(isRecordingHere);
  isRecordingHereRef.current = isRecordingHere;

  // Whether this question is still on screen when a pending Start resolves. Set in the effect rather than
  // at declaration, so that StrictMode's remount marks it mounted again.
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Leaving mid-take discards the recording, as navigating away always has.
      if (!isRecordingHereRef.current) return;
      recorderHelper.cancelRecord();
      dispatch(setNotRecording());
    };
  }, []);

  const onStartRecord = (): void => {
    recorderHelper
      .startRecord()
      .then(() => {
        // Unmounted while waiting for the mic, e.g. on the permission prompt: no Stop button is left to
        // end this take, so discard it rather than mark a departed question as recording.
        if (!isMountedRef.current) {
          recorderHelper.cancelRecord();
          return;
        }
        dispatch(setRecording({ recordingComponentId }));
      })
      // Mic failures surface through microphoneError; anything else leaves nothing to undo.
      .catch(() => {});
  };

  const onStopRecord = (onRecorded: (file: File) => void): void => {
    recorderHelper
      .stopRecord()
      .then(onRecorded)
      .catch(() => {})
      .finally(() => dispatch(setNotRecording()));
  };

  return {
    isRecording,
    isRecordingHere,
    microphoneError,
    onStartRecord,
    onStopRecord,
  };
};

export default useVoiceRecorder;
