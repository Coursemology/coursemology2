import { useState } from 'react';

import FormDialogue from 'lib/components/form/FormDialogue';
import { useAppSelector } from 'lib/hooks/store';

import { EventFormValues, FormSubmitHandler } from '../../types';

import EventForm from './EventForm';

interface EventFormDialogProps {
  open: boolean;
  onClose: () => void;
  formTitle?: string;
  initialValues: EventFormValues;
  onSubmit: FormSubmitHandler<EventFormValues>;
}

interface EventSuggestions {
  eventTypes: string[];
  eventLocations: string[];
}

/**
 * Controlled by whoever opens it: the owner supplies the handler and the initial
 * values, and the dialog closes itself once `onSubmit` reports success. The
 * handler used to be stashed in the Redux store, which is not serialisable.
 *
 * The existing event types and locations are still read from the store, since
 * they are derived from the lesson plan itself rather than from the opener.
 */
const EventFormDialog = (props: EventFormDialogProps): JSX.Element => {
  const { open, onClose, formTitle, initialValues, onSubmit } = props;

  const [isDirty, setIsDirty] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const items = useAppSelector((state) => state.lessonPlan.lessonPlan.items);

  const { eventTypes, eventLocations } = items.reduce<EventSuggestions>(
    (values, item) => {
      if (!item.eventId) {
        return values;
      }
      if (item.location) {
        values.eventLocations.push(item.location);
      }
      if (item.lesson_plan_item_type?.[0]) {
        values.eventTypes.push(item.lesson_plan_item_type[0]);
      }
      return values;
    },
    { eventTypes: [], eventLocations: [] },
  );

  const handleSubmit: FormSubmitHandler<EventFormValues> = async (
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
      form="event-form"
      hideForm={onClose}
      open={open}
      skipConfirmation={!isDirty}
      title={formTitle}
    >
      <EventForm
        disabled={submitting}
        eventLocations={[...new Set(eventLocations)]}
        eventTypes={[...new Set(eventTypes)]}
        initialValues={initialValues}
        onDirtyChange={setIsDirty}
        onSubmit={handleSubmit}
      />
    </FormDialogue>
  );
};

export default EventFormDialog;
