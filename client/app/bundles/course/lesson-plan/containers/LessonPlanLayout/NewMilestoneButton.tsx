import { useState } from 'react';
import { defineMessages } from 'react-intl';

import AddButton from 'lib/components/core/buttons/AddButton';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { createMilestone } from '../../operations';
import { FormSubmitHandler, MilestoneFormValues } from '../../types';
import MilestoneFormDialog from '../MilestoneFormDialog';

const translations = defineMessages({
  newMilestone: {
    id: 'course.lessonPlan.LessonPlanLayout.NewMilestoneButton.newMilestone',
    defaultMessage: 'New Milestone',
  },
  success: {
    id: 'course.lessonPlan.LessonPlanLayout.NewMilestoneButton.success',
    defaultMessage: 'Milestone created.',
  },
  failure: {
    id: 'course.lessonPlan.LessonPlanLayout.NewMilestoneButton.failure',
    defaultMessage: 'Failed to create milestone.',
  },
});

const initialValues: MilestoneFormValues = {
  title: '',
  description: '',
  start_at: null,
};

const NewMilestoneButton = (): JSX.Element | null => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const canManageLessonPlan = useAppSelector(
    (state) => state.lessonPlan.flags.canManageLessonPlan,
  );

  const [formVisible, setFormVisible] = useState(false);

  const createMilestoneHandler: FormSubmitHandler<MilestoneFormValues> = (
    data,
    setError,
  ) =>
    dispatch(
      createMilestone(
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
        {t(translations.newMilestone)}
      </AddButton>

      <MilestoneFormDialog
        formTitle={t(translations.newMilestone)}
        initialValues={initialValues}
        onClose={(): void => setFormVisible(false)}
        onSubmit={createMilestoneHandler}
        open={formVisible}
      />
    </>
  );
};

export default NewMilestoneButton;
