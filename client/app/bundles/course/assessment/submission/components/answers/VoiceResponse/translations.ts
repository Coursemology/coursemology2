import { defineMessages } from 'react-intl';

export default defineMessages({
  startRecording: {
    id: 'course.assessment.submission.VoiceResponseAnswer.startRecording',
    defaultMessage: 'Start Recording',
  },
  stopRecording: {
    id: 'course.assessment.submission.VoiceResponseAnswer.stopRecording',
    defaultMessage: 'Stop Recording',
  },
  chooseVoiceFileExplain: {
    id: 'course.assessment.submission.VoiceResponseAnswer.chooseVoiceFileExplain',
    defaultMessage:
      'Drag your audio file here, or click to select an audio file. Common audio formats such as mp3, wav, ' +
      'm4a, ogg and webm are supported. Alternatively, you may use the recorder below to record your response',
  },
  pleaseRecordYourVoice: {
    id: 'course.assessment.submission.VoiceResponseAnswer.pleaseRecordYourVoice',
    defaultMessage: 'Please record your voice',
  },
  microphoneBlocked: {
    id: 'course.assessment.submission.VoiceResponseAnswer.microphoneBlocked',
    defaultMessage:
      'Microphone access is blocked. To record, allow this site to use your microphone in your ' +
      "browser's settings, then click Start Recording again.",
  },
  microphoneNotFound: {
    id: 'course.assessment.submission.VoiceResponseAnswer.microphoneNotFound',
    defaultMessage:
      'No microphone was found. Connect a microphone, then click Start Recording again.',
  },
  microphoneUnavailable: {
    id: 'course.assessment.submission.VoiceResponseAnswer.microphoneUnavailable',
    defaultMessage:
      'Your microphone could not be started. Check that no other application is using it, then click ' +
      'Start Recording again.',
  },
  recordingNotSupported: {
    id: 'course.assessment.submission.VoiceResponseAnswer.recordingNotSupported',
    defaultMessage:
      'Your browser does not support recording. You can still upload an audio file above.',
  },
});
