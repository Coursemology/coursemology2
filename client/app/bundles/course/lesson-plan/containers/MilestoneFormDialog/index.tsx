import { useState } from 'react';

import FormDialogue from 'lib/components/form/FormDialogue';

import { FormSubmitHandler, MilestoneFormValues } from '../../types';

import MilestoneForm from './MilestoneForm';

interface MilestoneFormDialogProps {
  open: boolean;
  onClose: () => void;
  formTitle?: string;
  initialValues: MilestoneFormValues;
  onSubmit: FormSubmitHandler<MilestoneFormValues>;
}

/**
 * Controlled by whoever opens it: the owner supplies the handler and the initial
 * values, and the dialog closes itself once `onSubmit` reports success. The
 * handler used to be stashed in the Redux store, which is not serialisable.
 */
const MilestoneFormDialog = (props: MilestoneFormDialogProps): JSX.Element => {
  const { open, onClose, formTitle, initialValues, onSubmit } = props;

  const [isDirty, setIsDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit: FormSubmitHandler<MilestoneFormValues> = async (
    data,
    setError,
  ) => {
    setSubmitting(true);
    try {
      const succeeded = await onSubmit(data, setError);
      if (succeeded) onClose();
      return succeeded;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormDialogue
      disabled={submitting}
      form="milestone-form"
      hideForm={onClose}
      open={open}
      skipConfirmation={!isDirty}
      title={formTitle}
    >
      <MilestoneForm
        disabled={submitting}
        initialValues={initialValues}
        onDirtyChange={setIsDirty}
        onSubmit={handleSubmit}
      />
    </FormDialogue>
  );
};

export default MilestoneFormDialog;
