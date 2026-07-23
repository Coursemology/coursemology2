// eslint-disable-next-line import/no-relative-packages
import Recorder from '../../../../../vendor/recorderjs';

let recorder;
let recording = false;
let startingPromise;

const initRecorder = () =>
  Promise.resolve().then(() => {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    navigator.getUserMedia =
      navigator.getUserMedia || navigator.webkitGetUserMedia;
    window.URL = window.URL || window.webkitURL;
    const audioContext = new AudioContext();

    const startUserMedia = (stream) => {
      const mediaStreamSource = audioContext.createMediaStreamSource(stream);
      recorder = new Recorder(mediaStreamSource);
      return recorder;
    };

    return navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(startUserMedia);
  });

const startRecord = () => {
  if (recording) {
    return Promise.resolve();
  }
  if (startingPromise) {
    return startingPromise;
  }

  const startRecorder = () => {
    if (recording) return;
    recorder.record();
    recording = true;
  };
  const recorderPromise = recorder ? Promise.resolve() : initRecorder();
  startingPromise = recorderPromise
    .then(() => {
      startRecorder();
    })
    .finally(() => {
      startingPromise = null;
    });

  return startingPromise;
};

/**
 * Promise will resolve a file object
 */
const stopRecord = () => {
  if (!recording) {
    return Promise.reject(new Error('Recorder has already stopped'));
  }
  if (!recorder) {
    return Promise.reject(new Error('Recorder has not started yet'));
  }
  return new Promise((resolve) => {
    recorder.stop();
    recording = false;
    recorder.exportWAV((blob) => {
      const fileName = `${Math.round(new Date().getTime() / 1000)}.wav`;
      const file = new File([blob], fileName, {
        lastModified: new Date(new Date().setSeconds(0)),
        type: blob.type || 'audio/wav',
      });
      resolve(file);
    });
    recorder.clear();
  });
};

const isRecording = () => recording;

export default {
  startRecord,
  stopRecord,
  isRecording,
};
