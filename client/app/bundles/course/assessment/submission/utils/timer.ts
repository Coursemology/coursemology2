import { BUFFER_TIME_TO_FORCE_SUBMIT_MS } from '../constants';

export const setTimerForForceSubmission = (
  submissionTimeLimitAt: number,
  handleSubmit: () => Promise<void>,
): (() => void) => {
  const interval = setInterval(() => {
    const currentTime = new Date().getTime();
    const remainingSeconds =
      submissionTimeLimitAt + BUFFER_TIME_TO_FORCE_SUBMIT_MS - currentTime;

    if (remainingSeconds < 0) {
      handleSubmit();
      clearInterval(interval);
    }
  }, 1000);

  return (): void => clearInterval(interval);
};
