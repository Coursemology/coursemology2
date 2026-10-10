import { act, renderHook, type RenderHookResult } from '@testing-library/react';

import useRubricAdvanceConfirmation, {
  SubmissionResult,
} from '../useRubricAdvanceConfirmation';

class ConfirmationRequired extends Error {}

type Hook = RenderHookResult<
  ReturnType<typeof useRubricAdvanceConfirmation<string>>,
  unknown
>;

const setup = (submit: jest.Mock): Hook =>
  renderHook(() =>
    useRubricAdvanceConfirmation<string>(
      submit,
      (error) => error instanceof ConfirmationRequired,
    ),
  );

// Starts a submission that the backend rejects as needing confirmation, leaving the prompt open.
const startConfirmation = async (
  submit: jest.Mock,
): Promise<{ hook: Hook; submission: Promise<SubmissionResult> }> => {
  submit.mockRejectedValueOnce(new ConfirmationRequired());
  const hook = setup(submit);
  let submission!: Promise<SubmissionResult>;
  await act(async () => {
    submission = hook.result.current.handleSubmit('data');
  });
  expect(hook.result.current.isConfirming).toBe(true);
  return { hook, submission };
};

describe('useRubricAdvanceConfirmation', () => {
  it('settles the submission with false when cancelled, so the form is enabled again', async () => {
    const submit = jest.fn();
    const { hook, submission } = await startConfirmation(submit);

    act(() => hook.result.current.cancel());

    await expect(submission).resolves.toBe(false);
    expect(hook.result.current.isConfirming).toBe(false);
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it('re-submits with confirmation and settles with its outcome when confirmed', async () => {
    const submit = jest.fn();
    const { hook, submission } = await startConfirmation(submit);

    submit.mockResolvedValueOnce(undefined);
    act(() => hook.result.current.confirm());

    await expect(submission).resolves.toBeUndefined();
    expect(submit).toHaveBeenLastCalledWith('data', true);
  });

  it('rejects the submission when the confirmed re-submission fails', async () => {
    const submit = jest.fn();
    const { hook, submission } = await startConfirmation(submit);

    submit.mockRejectedValueOnce('Save failed');
    act(() => hook.result.current.confirm());

    await expect(submission).rejects.toBe('Save failed');
  });

  it('passes other errors straight through, without prompting', async () => {
    const submit = jest.fn().mockRejectedValueOnce('Invalid');
    const hook = setup(submit);

    await act(async () => {
      await expect(hook.result.current.handleSubmit('data')).rejects.toBe(
        'Invalid',
      );
    });
    expect(hook.result.current.isConfirming).toBe(false);
  });
});
