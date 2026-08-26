import { useState } from 'react';
import { defineMessages } from 'react-intl';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import { IconButton } from '@mui/material';

import { setNotification, showDeleteConfirmation } from 'lib/actions';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import MilestoneFormDialog from '../../containers/MilestoneFormDialog';
import { deleteMilestone, updateMilestone } from '../../operations';
import {
  FormSubmitHandler,
  MilestoneFormValues,
  MilestoneOrPlaceholder,
} from '../../types';

const translations = defineMessages({
  editMilestone: {
    id: 'course.lessonPlan.LessonPlanShow.MilestoneAdminTools.editMilestone',
    defaultMessage: 'Edit Milestone',
  },
  updateSuccess: {
    id: 'course.lessonPlan.LessonPlanShow.MilestoneAdminTools.updateSuccess',
    defaultMessage: 'Milestone updated.',
  },
  updateFailure: {
    id: 'course.lessonPlan.LessonPlanShow.MilestoneAdminTools.updateFailure',
    defaultMessage: 'Failed to update milestone.',
  },
  deleteSuccess: {
    id: 'course.lessonPlan.LessonPlanShow.MilestoneAdminTools.deleteSuccess',
    defaultMessage: 'Milestone deleted.',
  },
  deleteFailure: {
    id: 'course.lessonPlan.LessonPlanShow.MilestoneAdminTools.deleteFailure',
    defaultMessage: 'Failed to delete milestone.',
  },
});

interface MilestoneAdminToolsProps {
  milestone: MilestoneOrPlaceholder;
}

const MilestoneAdminTools = (
  props: MilestoneAdminToolsProps,
): JSX.Element | null => {
  const { milestone } = props;

  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const canManageLessonPlan = useAppSelector(
    (state) => state.lessonPlan.flags.canManageLessonPlan,
  );

  const [formVisible, setFormVisible] = useState(false);

  const deleteMilestoneHandler = (): void => {
    const handleDelete = (): Promise<void> =>
      dispatch(
        deleteMilestone(
          milestone.id,
          t(translations.deleteSuccess),
          t(translations.deleteFailure),
        ),
      );

    dispatch(showDeleteConfirmation(handleDelete));
  };

  const updateMilestoneHandler: FormSubmitHandler<MilestoneFormValues> = async (
    data,
    setError,
  ) => {
    // `updateMilestone` reports the outcome and leaves the message to us; see
    // the operation for why.
    const succeeded = await dispatch(
      updateMilestone(milestone.id, data, setError),
    );

    dispatch(
      setNotification(
        succeeded
          ? t(translations.updateSuccess)
          : t(translations.updateFailure),
      ),
    );

    return succeeded;
  };

  if (!milestone.id || !canManageLessonPlan) return null;

  const { title, description, start_at: startAt } = milestone;
  // Only the synthesised milestone carries a node title, and it is filtered out
  // by the guard above, so anything reaching the form is a plain string.
  const editableTitle = typeof title === 'string' ? title : undefined;

  return (
    <span>
      <IconButton onClick={(): void => setFormVisible(true)}>
        <Edit />
      </IconButton>

      <IconButton color="error" onClick={deleteMilestoneHandler}>
        <Delete />
      </IconButton>

      <MilestoneFormDialog
        formTitle={t(translations.editMilestone)}
        initialValues={{
          title: editableTitle,
          description: description ?? undefined,
          start_at: startAt,
        }}
        onClose={(): void => setFormVisible(false)}
        onSubmit={updateMilestoneHandler}
        open={formVisible}
      />
    </span>
  );
};

export default MilestoneAdminTools;
