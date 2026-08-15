import { BUFFER_TIME_TO_FORCE_SUBMIT_MS, workflowStates } from '../constants';
import { AssessmentState, SubmissionState } from '../types';

// Milliseconds from load until an attempting submission should be force-submitted, as computed by
// the server (Course::Assessment::Submission#force_submit_at, the earlier of time-limit expiry and
// the effective deadline) and forwarded as `forceSubmitRemainingTime`. A duration rather than an
// absolute time, so consumers anchor it to the local clock and a skewed client clock does not fire
// the force-submit early or late. Null unless the submission is still being attempted.
export const getForceSubmitRemainingTime = (
  submission: Pick<SubmissionState, 'workflowState'>,
  assessment: Pick<AssessmentState, 'forceSubmitRemainingTime'>,
): number | null => {
  if (submission.workflowState !== workflowStates.Attempting) return null;

  return assessment.forceSubmitRemainingTime ?? null;
};

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
