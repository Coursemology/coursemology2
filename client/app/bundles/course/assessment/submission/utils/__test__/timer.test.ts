import { WorkflowState } from 'types/course/assessment/submission/submission';

import { BUFFER_TIME_TO_FORCE_SUBMIT_MS } from '../../constants';
import { AssessmentState, SubmissionState } from '../../types';
import {
  getForceSubmitRemainingTime,
  setTimerForForceSubmission,
} from '../timer';

const attempting = {
  workflowState: 'attempting' as WorkflowState,
} as unknown as SubmissionState;
const forceSubmitRemainingTime = 30 * 60 * 1000;

describe('getForceSubmitRemainingTime', () => {
  it('returns null when the submission is not attempting', () => {
    const submitted = {
      ...attempting,
      workflowState: 'submitted' as WorkflowState,
    };
    expect(
      getForceSubmitRemainingTime(submitted, {
        forceSubmitRemainingTime,
      } as AssessmentState),
    ).toBeNull();
  });

  it('returns null when the server provides no remaining time', () => {
    expect(
      getForceSubmitRemainingTime(attempting, {} as AssessmentState),
    ).toBeNull();
    expect(
      getForceSubmitRemainingTime(attempting, {
        forceSubmitRemainingTime: null,
      } as AssessmentState),
    ).toBeNull();
  });

  it('forwards the server-provided remaining time unchanged', () => {
    expect(
      getForceSubmitRemainingTime(attempting, {
        forceSubmitRemainingTime,
      } as AssessmentState),
    ).toEqual(forceSubmitRemainingTime);
  });
});

describe('setTimerForForceSubmission', () => {
  const remaining = 5000;
  const wellPastExpiry = remaining + BUFFER_TIME_TO_FORCE_SUBMIT_MS + 2000;

  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('force-submits once the timer expires', () => {
    const handleSubmit = jest.fn().mockResolvedValue(undefined);

    setTimerForForceSubmission(remaining, handleSubmit);
    expect(handleSubmit).not.toHaveBeenCalled();

    jest.advanceTimersByTime(remaining); // reached the deadline, still within the grace buffer
    expect(handleSubmit).not.toHaveBeenCalled();

    jest.advanceTimersByTime(wellPastExpiry - remaining);
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it('does not force-submit after the timer is disarmed (page navigated away)', () => {
    const handleSubmit = jest.fn().mockResolvedValue(undefined);

    const teardown = setTimerForForceSubmission(remaining, handleSubmit);
    teardown(); // what SubmissionForm's effect cleanup runs on unmount

    jest.advanceTimersByTime(wellPastExpiry);
    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
