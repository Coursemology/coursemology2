import { useState } from 'react';
import { defineMessages } from 'react-intl';

import AddButton from 'lib/components/core/buttons/AddButton';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { createEvent } from '../../operations';
import { EventFormValues, FormSubmitHandler } from '../../types';
import EventFormDialog from '../EventFormDialog';

const translations = defineMessages({
  newEvent: {
    id: 'course.lessonPlan.LessonPlanLayout.NewEventButton.newEvent',
    defaultMessage: 'New Event',
  },
  success: {
    id: 'course.lessonPlan.LessonPlanLayout.NewEventButton.success',
    defaultMessage: 'Event created.',
  },
  failure: {
    id: 'course.lessonPlan.LessonPlanLayout.NewEventButton.failure',
    defaultMessage: 'Failed to create event.',
  },
});

const initialValues: EventFormValues = {
  title: '',
  event_type: '',
  location: '',
  description: '',
  start_at: null,
  end_at: null,
  published: false,
};

const NewEventButton = (): JSX.Element | null => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const canManageLessonPlan = useAppSelector(
    (state) => state.lessonPlan.flags.canManageLessonPlan,
  );

  const [formVisible, setFormVisible] = useState(false);

  const createEventHandler: FormSubmitHandler<EventFormValues> = (
    data,
    setError,
  ) =>
    dispatch(
      createEvent(
        data,
        t(translations.success),
        t(translations.failure),
        setError,
      ),
    );

  if (!canManageLessonPlan) return null;

  return (
    <>
      <AddButton fixed onClick={(): void => setFormVisible(true)}>
        {t(translations.newEvent)}
      </AddButton>

      <EventFormDialog
        formTitle={t(translations.newEvent)}
        initialValues={initialValues}
        onClose={(): void => setFormVisible(false)}
        onSubmit={createEventHandler}
        open={formVisible}
      />
    </>
  );
};

export default NewEventButton;
