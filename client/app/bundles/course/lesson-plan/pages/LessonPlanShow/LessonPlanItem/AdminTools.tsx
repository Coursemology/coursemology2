import { useState } from 'react';
import { defineMessages } from 'react-intl';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import { IconButton } from '@mui/material';

import { showDeleteConfirmation } from 'lib/actions';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import EventFormDialog from '../../../containers/EventFormDialog';
import { deleteEvent, updateEvent } from '../../../operations';
import {
  EventFormValues,
  FormSubmitHandler,
  LessonPlanEventItem,
} from '../../../types';

const translations = defineMessages({
  editEvent: {
    id: 'course.lessonPlan.LessonPlanShow.LessonPlanItem.AdminTools.editEvent',
    defaultMessage: 'Edit Event',
  },
  updateSuccess: {
    id: 'course.lessonPlan.LessonPlanShow.LessonPlanItem.AdminTools.updateSuccess',
    defaultMessage: 'Event updated.',
  },
  updateFailure: {
    id: 'course.lessonPlan.LessonPlanShow.LessonPlanItem.AdminTools.updateFailure',
    defaultMessage: 'Failed to update event.',
  },
  deleteSuccess: {
    id: 'course.lessonPlan.LessonPlanShow.LessonPlanItem.AdminTools.deleteSuccess',
    defaultMessage: 'Event deleted.',
  },
  deleteFailure: {
    id: 'course.lessonPlan.LessonPlanShow.LessonPlanItem.AdminTools.deleteFailure',
    defaultMessage: 'Failed to delete event.',
  },
});

const styles = {
  tools: {
    top: 16,
    right: 20,
    position: 'absolute' as const,
  },
};

interface AdminToolsProps {
  item: LessonPlanEventItem;
}

const AdminTools = (props: AdminToolsProps): JSX.Element | null => {
  const { item } = props;

  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const canManageLessonPlan = useAppSelector(
    (state) => state.lessonPlan.flags.canManageLessonPlan,
  );

  const [formVisible, setFormVisible] = useState(false);

  const deleteEventHandler = (): void => {
    const handleDelete = (): Promise<void> =>
      dispatch(
        deleteEvent(
          item.id,
          item.eventId,
          t(translations.deleteSuccess),
          t(translations.deleteFailure),
        ),
      );

    dispatch(showDeleteConfirmation(handleDelete));
  };

  const updateEventHandler: FormSubmitHandler<EventFormValues> = (
    data,
    setError,
  ) =>
    dispatch(
      updateEvent(
        item.eventId,
        data,
        t(translations.updateSuccess),
        t(translations.updateFailure),
        setError,
      ),
    );

  if (!canManageLessonPlan || item.eventId === undefined) return null;

  const {
    title,
    lesson_plan_item_type: itemType,
    location,
    description,
    start_at: startAt,
    end_at: endAt,
    published,
  } = item;

  return (
    <span style={styles.tools}>
      <IconButton onClick={(): void => setFormVisible(true)}>
        <Edit />
      </IconButton>

      <IconButton color="error" onClick={deleteEventHandler}>
        <Delete />
      </IconButton>

      <EventFormDialog
        formTitle={t(translations.editEvent)}
        initialValues={{
          title,
          location,
          description,
          start_at: startAt,
          end_at: endAt,
          published,
          event_type: itemType?.[0],
        }}
        onClose={(): void => setFormVisible(false)}
        onSubmit={updateEventHandler}
        open={formVisible}
      />
    </span>
  );
};

export default AdminTools;
