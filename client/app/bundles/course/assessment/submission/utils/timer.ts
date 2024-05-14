import { BUFFER_TIME_TO_FORCE_SUBMIT_MS } from '../constants';

export const setTimerForForceSubmission = (
  deadline: number,
  attempting: boolean,
  submitAnswer: () => Promise<void>,
): (() => void) => {
  const interval = setInterval(() => {
    const currentTime = new Date();
    const remainingSeconds =
      new Date(deadline).getTime() +
      BUFFER_TIME_TO_FORCE_SUBMIT_MS -
      currentTime.getTime();

    if (remainingSeconds < 0) {
      if (attempting) {
        submitAnswer();
      }
      clearInterval(interval);
    }
  }, 1000);

  return (): void => clearInterval(interval);
};
