import { useEffect, useRef, useSyncExternalStore } from 'react';

import { MAX_VOICE_RESPONSE_FILE_SIZE } from 'lib/constants/sharedConstants';
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
  // `onLimitReached` receives a take stopped automatically at the size limit.
  onStartRecord: (onLimitReached: (file: File) => void) => void;
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

  const onStartRecord = (onLimitReached: (file: File) => void): void => {
    recorderHelper
      .startRecord({
        maxBytes: MAX_VOICE_RESPONSE_FILE_SIZE,
        onLimitReached: (file) => {
          // Unmounted while the stop flushed its last chunk: see onStopRecord.
          if (!isMountedRef.current) return;
          dispatch(setNotRecording());
          onLimitReached(file);
        },
      })
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
    // Only the stop that ends the take may release the controls. Once the recorder has no take of its own,
    // a stop (this one, or an automatic one at the size limit) is already flushing the last chunk, so a
    // further click is ignored: its failure would otherwise re-enable Start early, and clear the state of a
    // take started in the meantime.
    if (!recorderHelper.isRecording()) return;

    recorderHelper
      .stopRecord()
      // A stop completes asynchronously, after the question may have unmounted. Its cleanup has already
      // released the controls, and another question may be recording by now.
      .then((file) => {
        if (isMountedRef.current) onRecorded(file);
      })
      .catch(() => {})
      .finally(() => {
        if (isMountedRef.current) dispatch(setNotRecording());
      });
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
