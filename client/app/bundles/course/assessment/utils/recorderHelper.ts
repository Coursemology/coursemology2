// The microphone recorder shared by every voice-response question on the page. Only one take is captured
// at a time, so the mic stream and the take in progress live here rather than in a component.
//
// The stream outlives each take: like the old recorderjs pipeline, it is acquired once and reused, so a
// second take has no permission prompt and no warm-up. Each take gets its own MediaRecorder, because only
// the first chunk of a MediaRecorder session carries the container header -- pausing one recorder across
// takes would leave every later take unplayable.

// First supported and playable on this device wins. MP4/AAC first for the widest playback support;
// WebM/Opus where MP4 recording isn't available (Firefox).
const PREFERRED_MIME_TYPES = [
  'audio/mp4',
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
];

// How often chunks arrive when a take has a size limit, and how close to the limit a take may get. The
// headroom covers the final chunk, which arrives only after the take is stopped.
const LIMIT_CHECK_INTERVAL_MS = 1000;
const LIMIT_HEADROOM = 0.95;

const EXTENSIONS: Record<string, string> = {
  'audio/mp4': 'm4a',
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
};

export type MicrophoneError =
  | 'NotAllowedError'
  | 'NotFoundError'
  | 'OtherError';

interface Take {
  recorder: MediaRecorder;
  chunks: Blob[];
}

let stream: MediaStream | null = null;
let pendingStream: Promise<MediaStream> | null = null;
// Set when the page lets go of the mic while getUserMedia is still pending (e.g. StrictMode's dev-only
// unmount, or leaving before answering the prompt), so the stream is stopped as soon as it arrives.
let releaseRequested = false;
let take: Take | null = null;
let microphoneError: MicrophoneError | null = null;
const microphoneErrorListeners = new Set<() => void>();

const setMicrophoneError = (error: MicrophoneError | null): void => {
  if (error === microphoneError) return;
  microphoneError = error;
  microphoneErrorListeners.forEach((listener) => listener());
};

const toMicrophoneError = (error: unknown): MicrophoneError => {
  const name = error instanceof DOMException ? error.name : '';
  if (name === 'NotAllowedError' || name === 'SecurityError')
    return 'NotAllowedError';
  if (name === 'NotFoundError') return 'NotFoundError';
  return 'OtherError';
};

const stopTracks = (source: MediaStream): void =>
  source.getTracks().forEach((track) => track.stop());

// A track ends when the device is unplugged or the permission is revoked mid-session.
const isLive = (source: MediaStream | null): source is MediaStream =>
  Boolean(
    source?.getAudioTracks().some((track) => track.readyState === 'live'),
  );

const requestStream = (): Promise<MediaStream> => {
  if (isLive(stream)) return Promise.resolve(stream);

  pendingStream ??= navigator.mediaDevices
    .getUserMedia({ audio: { channelCount: 2 } })
    .then(
      (acquired) => {
        if (releaseRequested) {
          stopTracks(acquired);
          throw new DOMException('Microphone was released', 'AbortError');
        }
        stream = acquired;
        setMicrophoneError(null);
        return acquired;
      },
      (error) => {
        setMicrophoneError(toMicrophoneError(error));
        throw error;
      },
    )
    .finally(() => {
      pendingStream = null;
    });

  return pendingStream;
};

const pickMimeType = (): string | undefined => {
  const probe = document.createElement('audio');
  return PREFERRED_MIME_TYPES.find(
    (type) =>
      MediaRecorder.isTypeSupported(type) && probe.canPlayType(type) !== '',
  );
};

const toFile = (chunks: Blob[], mimeType: string): File => {
  const type = mimeType.split(';')[0].trim() || 'audio/webm';
  const extension = EXTENSIONS[type] ?? type.split('/')[1];
  const fileName = `${Math.round(Date.now() / 1000)}.${extension}`;
  return new File(chunks, fileName, { type });
};

const isRecordingSupported = (): boolean =>
  typeof MediaRecorder !== 'undefined' &&
  Boolean(navigator.mediaDevices?.getUserMedia);

/**
 * Asks for the mic up front, so that the first take doesn't prompt. Never rejects: a failure is
 * reported through `getMicrophoneError`, and `startRecord` asks again.
 */
const acquireMicrophone = async (): Promise<void> => {
  releaseRequested = false;
  try {
    await requestStream();
  } catch {
    // Recorded in microphoneError, or the mic was released before the stream arrived.
  }
};

/**
 * Promise will resolve a file object
 */
const stopRecord = (): Promise<File> => {
  if (!take) return Promise.reject(new Error('Recorder has already stopped'));

  const { recorder, chunks } = take;
  take = null;

  // The recorder stops itself, flushing its last chunk, if its track ends mid-take.
  if (recorder.state === 'inactive')
    return Promise.resolve(toFile(chunks, recorder.mimeType));

  return new Promise((resolve, reject) => {
    // The last chunk arrives in `dataavailable` just before `stop`, so the file can only be built here.
    recorder.addEventListener(
      'stop',
      () => resolve(toFile(chunks, recorder.mimeType)),
      { once: true },
    );
    recorder.addEventListener('error', reject, { once: true });
    recorder.stop();
  });
};

interface StartRecordOptions {
  // Stops the take automatically once it nears this size.
  maxBytes?: number;
  // Receives a take that was stopped automatically at `maxBytes`.
  onLimitReached?: (file: File) => void;
}

const startRecord = async (options: StartRecordOptions = {}): Promise<void> => {
  const { maxBytes, onLimitReached } = options;
  if (take) throw new Error('Recorder has already started');

  releaseRequested = false;
  const source = await requestStream();
  // A second Start may have won the race while the stream was being requested.
  if (take) throw new Error('Recorder has already started');

  const mimeType = pickMimeType();
  const recorder = new MediaRecorder(
    source,
    mimeType ? { mimeType } : undefined,
  );
  const current: Take = { recorder, chunks: [] };
  let recordedBytes = 0;
  recorder.addEventListener('dataavailable', (event) => {
    if (event.data.size > 0) current.chunks.push(event.data);
    recordedBytes += event.data.size;

    const nearLimit =
      maxBytes !== undefined && recordedBytes >= maxBytes * LIMIT_HEADROOM;
    // Once stopped, this take is no longer `take`, so its final chunk doesn't stop it twice.
    if (nearLimit && take === current)
      stopRecord()
        .then((file) => onLimitReached?.(file))
        .catch(() => {});
  });
  // With a limit, chunks must arrive while recording so the size can be checked; without one, a single
  // chunk at the end is enough.
  recorder.start(maxBytes !== undefined ? LIMIT_CHECK_INTERVAL_MS : undefined);
  take = current;
};

/**
 * Stops the take in progress, if any, and throws its audio away. The mic stays acquired.
 */
const cancelRecord = (): void => {
  if (!take) return;

  const { recorder } = take;
  take = null;
  if (recorder.state !== 'inactive') recorder.stop();
};

/**
 * Lets go of the mic, discarding any take in progress.
 */
const releaseMicrophone = (): void => {
  releaseRequested = true;
  cancelRecord();
  if (stream) {
    stopTracks(stream);
    stream = null;
  }
};

const isRecording = (): boolean => take !== null;

const getMicrophoneError = (): MicrophoneError | null => microphoneError;

/**
 * For `useSyncExternalStore`: calls `listener` whenever `getMicrophoneError` changes.
 */
const subscribeToMicrophoneError = (listener: () => void): (() => void) => {
  microphoneErrorListeners.add(listener);
  return () => microphoneErrorListeners.delete(listener);
};

export default {
  acquireMicrophone,
  releaseMicrophone,
  startRecord,
  stopRecord,
  cancelRecord,
  isRecording,
  isRecordingSupported,
  getMicrophoneError,
  subscribeToMicrophoneError,
};
