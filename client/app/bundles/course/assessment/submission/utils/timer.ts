export const setTimerForForceSubmission = (
  deadline: number,
  attempting: boolean,
  submitAnswer: () => Promise<void>,
) => {
  return (): (() => void) => {
    const interval = setInterval(() => {
      const currentTime = new Date();
      const remainingSeconds =
        new Date(deadline).getTime() - currentTime.getTime();

      if (remainingSeconds < 0) {
        if (attempting) {
          submitAnswer();
        }
        clearInterval(interval);
      }
    }, 1000);

    return (): void => clearInterval(interval);
  };
};
