import type recorderHelper from '../recorderHelper';

interface FakeTrack {
  readyState: MediaStreamTrackState;
  stop: jest.Mock;
}

const newTrack = (): FakeTrack => {
  const track: FakeTrack = {
    readyState: 'live',
    stop: jest.fn(() => {
      track.readyState = 'ended';
    }),
  };
  return track;
};

// Mirrors the browser where it matters here: the final chunk and `stop` arrive asynchronously, and a
// recorder stops itself (flushing its last chunk) when its track ends.
class FakeMediaRecorder extends EventTarget {
  static instances: FakeMediaRecorder[] = [];

  static supported = new Set<string>();

  static isTypeSupported = (type: string): boolean =>
    FakeMediaRecorder.supported.has(type);

  state: RecordingState = 'inactive';

  mimeType: string;

  options?: MediaRecorderOptions;

  constructor(_stream: MediaStream, options?: MediaRecorderOptions) {
    super();
    this.options = options;
    // With no preference given, the browser picks its own format.
    this.mimeType = options?.mimeType ?? 'audio/ogg;codecs=opus';
    FakeMediaRecorder.instances.push(this);
  }

  start(): void {
    this.state = 'recording';
  }

  emit(data: string): void {
    const event = new Event('dataavailable');
    Object.assign(event, { data: new Blob([data]) });
    this.dispatchEvent(event);
  }

  stop(): void {
    if (this.state === 'inactive')
      throw new DOMException('', 'InvalidStateError');
    this.state = 'inactive';
    setTimeout(() => {
      this.emit('|end');
      this.dispatchEvent(new Event('stop'));
    });
  }

  endTrack(): void {
    this.state = 'inactive';
    this.emit('|end');
    this.dispatchEvent(new Event('stop'));
  }
}

const deferred = <T>(): {
  promise: Promise<T>;
  resolve: (value: T) => void;
} => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
};

// jsdom's Blob has no text().
const readText = (blob: Blob): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (): void => resolve(reader.result as string);
    reader.readAsText(blob);
  });

let helper: typeof recorderHelper;
let getUserMedia: jest.Mock;
let tracks: FakeTrack[];

const newStream = (): MediaStream => {
  const track = newTrack();
  tracks.push(track);
  return {
    getTracks: () => [track],
    getAudioTracks: () => [track],
  } as unknown as MediaStream;
};

const latestRecorder = (): FakeMediaRecorder =>
  FakeMediaRecorder.instances[FakeMediaRecorder.instances.length - 1];

const recordTake = async (data: string): Promise<File> => {
  await helper.startRecord();
  latestRecorder().emit(data);
  return helper.stopRecord();
};

beforeEach(async () => {
  jest.resetModules();
  tracks = [];
  FakeMediaRecorder.instances = [];
  FakeMediaRecorder.supported = new Set([
    'audio/mp4',
    'audio/webm;codecs=opus',
    'audio/webm',
  ]);
  Object.assign(globalThis, { MediaRecorder: FakeMediaRecorder });
  getUserMedia = jest.fn(async () => newStream());
  Object.defineProperty(navigator, 'mediaDevices', {
    value: { getUserMedia },
    configurable: true,
  });
  jest
    .spyOn(HTMLMediaElement.prototype, 'canPlayType')
    .mockReturnValue('maybe');
  helper = (await import('../recorderHelper')).default;
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('format', () => {
  it('records MP4 when the device can record and play it', async () => {
    const file = await recordTake('take');

    expect(file.name).toMatch(/^\d+\.m4a$/);
    expect(file.type).toBe('audio/mp4');
    expect(await readText(file)).toBe('take|end');
  });

  it('skips a format the device cannot play back', async () => {
    jest
      .spyOn(HTMLMediaElement.prototype, 'canPlayType')
      .mockImplementation((type) => (type === 'audio/mp4' ? '' : 'maybe'));

    const file = await recordTake('take');

    expect(latestRecorder().options).toEqual({
      mimeType: 'audio/webm;codecs=opus',
    });
    expect(file.name).toMatch(/^\d+\.webm$/);
    expect(file.type).toBe('audio/webm');
  });

  it('lets the browser choose when no preferred format is supported', async () => {
    FakeMediaRecorder.supported = new Set();

    const file = await recordTake('take');

    expect(latestRecorder().options).toBeUndefined();
    expect(file.name).toMatch(/^\d+\.ogg$/);
    expect(file.type).toBe('audio/ogg');
  });
});

describe('takes', () => {
  it('reuses the stream across takes, and each file holds only its own take', async () => {
    await helper.acquireMicrophone();

    await recordTake('first');
    const second = await recordTake('second');

    expect(getUserMedia).toHaveBeenCalledTimes(1);
    expect(FakeMediaRecorder.instances).toHaveLength(2);
    expect(await readText(second)).toBe('second|end');
  });

  it('asks for the mic on the first start when it was not acquired up front', async () => {
    await helper.startRecord();

    expect(getUserMedia).toHaveBeenCalledTimes(1);
    expect(helper.isRecording()).toBe(true);
  });

  it('rejects a second start while recording', async () => {
    await helper.startRecord();

    await expect(helper.startRecord()).rejects.toThrow(
      'Recorder has already started',
    );
  });

  it('rejects a stop when nothing is recording', async () => {
    await expect(helper.stopRecord()).rejects.toThrow(
      'Recorder has already stopped',
    );
  });

  it('keeps what was recorded when the track ends mid-take', async () => {
    await helper.startRecord();
    latestRecorder().emit('partial');
    latestRecorder().endTrack();

    const file = await helper.stopRecord();

    expect(await readText(file)).toBe('partial|end');
  });
});

describe('microphone lifetime', () => {
  it('keeps the mic through stop and cancel, and releases it on release', async () => {
    await helper.acquireMicrophone();
    await recordTake('kept');
    await helper.startRecord();
    helper.cancelRecord();

    expect(helper.isRecording()).toBe(false);
    expect(tracks[0].stop).not.toHaveBeenCalled();

    helper.releaseMicrophone();

    expect(tracks[0].stop).toHaveBeenCalled();
  });

  it('discards a take in progress on release', async () => {
    await helper.startRecord();

    helper.releaseMicrophone();

    expect(helper.isRecording()).toBe(false);
    expect(latestRecorder().state).toBe('inactive');
    expect(tracks[0].stop).toHaveBeenCalled();
  });

  it('stops a stream that arrives after the mic was released', async () => {
    const pending = deferred<MediaStream>();
    getUserMedia.mockReturnValueOnce(pending.promise);

    const acquiring = helper.acquireMicrophone();
    helper.releaseMicrophone();
    pending.resolve(newStream());
    await acquiring;

    expect(tracks[0].stop).toHaveBeenCalled();

    await helper.startRecord();

    expect(getUserMedia).toHaveBeenCalledTimes(2);
  });

  it('keeps one request through an acquire, release, acquire sequence (StrictMode)', async () => {
    const pending = deferred<MediaStream>();
    getUserMedia.mockReturnValueOnce(pending.promise);

    const first = helper.acquireMicrophone();
    helper.releaseMicrophone();
    const second = helper.acquireMicrophone();
    pending.resolve(newStream());
    await Promise.all([first, second]);
    await helper.startRecord();

    expect(getUserMedia).toHaveBeenCalledTimes(1);
    expect(tracks[0].stop).not.toHaveBeenCalled();
  });

  it('asks again when the held track has ended', async () => {
    await helper.acquireMicrophone();
    tracks[0].readyState = 'ended';

    await helper.startRecord();

    expect(getUserMedia).toHaveBeenCalledTimes(2);
  });
});

describe('errors', () => {
  it('reports a denied permission without rejecting, and clears it once granted', async () => {
    const denied = new DOMException('denied', 'NotAllowedError');
    getUserMedia.mockRejectedValueOnce(denied).mockRejectedValueOnce(denied);
    const listener = jest.fn();
    helper.subscribeToMicrophoneError(listener);

    await helper.acquireMicrophone();

    expect(helper.getMicrophoneError()).toBe('NotAllowedError');
    expect(listener).toHaveBeenCalledTimes(1);
    await expect(helper.startRecord()).rejects.toBe(denied);

    await helper.startRecord();

    expect(helper.getMicrophoneError()).toBeNull();
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('reports a missing device', async () => {
    getUserMedia.mockRejectedValueOnce(
      new DOMException('no mic', 'NotFoundError'),
    );

    await helper.acquireMicrophone();

    expect(helper.getMicrophoneError()).toBe('NotFoundError');
  });

  it('reports recording as unsupported without MediaRecorder', () => {
    Object.assign(globalThis, { MediaRecorder: undefined });

    expect(helper.isRecordingSupported()).toBe(false);
  });
});
