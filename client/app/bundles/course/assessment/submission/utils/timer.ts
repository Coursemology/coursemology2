import { BUFFER_TIME_TO_FORCE_SUBMIT_MS } from '../constants';

export const setTimerForForceSubmission = (
  forceSubmitRemainingTime: number,
  handleSubmit: () => Promise<void>,
): (() => void) => {
  // Anchor the server-provided duration to the local clock once, here, rather than trusting an
  // absolute timestamp against a possibly-skewed clock.
  const forceSubmitAt = Date.now() + forceSubmitRemainingTime;
  const interval = setInterval(() => {
    if (Date.now() > forceSubmitAt + BUFFER_TIME_TO_FORCE_SUBMIT_MS) {
      handleSubmit();
      clearInterval(interval);
    }
  }, 1000);

  return (): void => clearInterval(interval);
};
