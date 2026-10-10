import { useState } from 'react';

// What a question form's submission settles with: void when saved, false when the user cancelled it (the form is
// then enabled again, with its state intact). A rejection is a failed save.
export type SubmissionResult = void | false;

interface PendingSubmission<T> {
  data: T;
  settle: (result: SubmissionResult | Promise<SubmissionResult>) => void;
}

interface RubricAdvanceConfirmation<T> {
  // Pass as the form's onSubmit.
  handleSubmit: (data: T) => Promise<SubmissionResult>;
  // Whether the confirmation prompt is showing.
  isConfirming: boolean;
  confirm: () => void;
  cancel: () => void;
}

// Saving a rubric change that is incompatible with existing grades needs the user's confirmation: the backend rolls
// the first save back and rejects it (isConfirmationRequired), and confirming re-submits it with
// confirmRubricAdvance. The form's submission stays pending while the user decides, then settles with the decision:
// confirmed -> the re-submission's outcome; cancelled -> false.
const useRubricAdvanceConfirmation = <T>(
  submit: (data: T, confirmRubricAdvance: boolean) => Promise<void>,
  isConfirmationRequired: (error: unknown) => boolean,
): RubricAdvanceConfirmation<T> => {
  const [pending, setPending] = useState<PendingSubmission<T> | null>(null);

  const handleSubmit = (data: T): Promise<SubmissionResult> =>
    submit(data, false).catch((error) => {
      if (!isConfirmationRequired(error)) throw error;

      return new Promise<SubmissionResult>((resolve) => {
        setPending({ data, settle: resolve });
      });
    });

  const confirm = (): void => {
    if (!pending) return;

    setPending(null);
    pending.settle(submit(pending.data, true));
  };

  const cancel = (): void => {
    if (!pending) return;

    setPending(null);
    pending.settle(false);
  };

  return { handleSubmit, isConfirming: pending !== null, confirm, cancel };
};

export default useRubricAdvanceConfirmation;
