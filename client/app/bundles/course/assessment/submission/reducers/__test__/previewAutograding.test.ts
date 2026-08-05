import reducer, {
  previewAutogradingFailed,
  previewAutogradingSandboxGone,
  previewAutogradingSettled,
  previewAutogradingStarted,
} from '../previewAutograding';

describe('previewAutograding reducer', () => {
  it('starts idle with no job', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual({
      jobUrl: null,
      status: 'idle',
    });
  });

  it('records the job url and starts polling', () => {
    const state = reducer(
      undefined,
      previewAutogradingStarted({ jobUrl: '/jobs/9' }),
    );

    expect(state).toEqual({ jobUrl: '/jobs/9', status: 'polling' });
  });

  it('clears itself back to idle when the job settles', () => {
    const polling = reducer(
      undefined,
      previewAutogradingStarted({ jobUrl: '/jobs/9' }),
    );

    expect(reducer(polling, previewAutogradingSettled())).toEqual({
      jobUrl: null,
      status: 'idle',
    });
  });

  it('drops the job url but remembers the failure so the banner can persist', () => {
    const polling = reducer(
      undefined,
      previewAutogradingStarted({ jobUrl: '/jobs/9' }),
    );

    expect(reducer(polling, previewAutogradingFailed())).toEqual({
      jobUrl: null,
      status: 'failed',
    });
  });

  it('lets a fresh finalise restart polling after a previous failure', () => {
    const failed = reducer(undefined, previewAutogradingFailed());

    expect(
      reducer(failed, previewAutogradingStarted({ jobUrl: '/jobs/10' })),
    ).toEqual({ jobUrl: '/jobs/10', status: 'polling' });
  });

  it('marks the sandbox gone, dropping the job url', () => {
    const polling = reducer(
      undefined,
      previewAutogradingStarted({ jobUrl: '/jobs/9' }),
    );

    expect(reducer(polling, previewAutogradingSandboxGone())).toEqual({
      jobUrl: null,
      status: 'gone',
    });
  });
});
