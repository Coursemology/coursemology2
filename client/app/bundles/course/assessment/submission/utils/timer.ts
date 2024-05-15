import { BUFFER_TIME_TO_FORCE_SUBMIT_MS } from '../constants';

export const setTimerForForceSubmission = (
  deadline: number,
  handleSubmit: () => Promise<void>,
): (() => void) => {
  const interval = setInterval(() => {
    const currentTime = new Date();
    const remainingSeconds =
      new Date(deadline).getTime() +
      BUFFER_TIME_TO_FORCE_SUBMIT_MS -
      currentTime.getTime();

    if (remainingSeconds < 0) {
      handleSubmit();
      clearInterval(interval);
    }
  }, 1000);

  return (): void => clearInterval(interval);
};
