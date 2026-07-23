const mockRecord = jest.fn();
const mockRecorder = jest.fn().mockImplementation(() => ({
  record: mockRecord,
}));

jest.mock('../../../../../../vendor/recorderjs', () => mockRecorder);

const setupRecorder = (getUserMedia = jest.fn().mockResolvedValue({})) => {
  if (!window.AudioContext) {
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: jest.fn(),
      writable: true,
    });
  }

  jest.spyOn(window, 'AudioContext').mockImplementation(() => ({
    createMediaStreamSource: jest.fn(),
  }));
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: { getUserMedia },
  });
};

describe('recorderHelper', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetModules();
    mockRecord.mockClear();
    mockRecorder.mockClear();
    setupRecorder();
  });

  it('does not reject or restart the recorder when startRecord is called while already recording', async () => {
    const recorderHelper = (await import('../recorderHelper')).default;

    await recorderHelper.startRecord();

    await expect(recorderHelper.startRecord()).resolves.toBeUndefined();
    expect(mockRecord).toHaveBeenCalledTimes(1);
  });

  it('coalesces concurrent startRecord calls while the recorder is initialising', async () => {
    let resolveMicrophone;
    const getUserMedia = jest.fn(
      () =>
        new Promise((resolve) => {
          resolveMicrophone = resolve;
        }),
    );
    setupRecorder(getUserMedia);
    const recorderHelper = (await import('../recorderHelper')).default;

    const firstStart = recorderHelper.startRecord();
    const secondStart = recorderHelper.startRecord();

    await Promise.resolve();
    resolveMicrophone({});
    await Promise.all([firstStart, secondStart]);

    expect(getUserMedia).toHaveBeenCalledTimes(1);
    expect(mockRecorder).toHaveBeenCalledTimes(1);
    expect(mockRecord).toHaveBeenCalledTimes(1);
  });
});
