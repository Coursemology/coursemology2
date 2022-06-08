import { FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Typography } from '@mui/material';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import PageHeader from 'lib/components/pages/PageHeader';
import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { getCourseId } from 'lib/helpers/url-helpers';
import { AppDispatch, AppState } from 'types/store';
import { AchievementEditFormData } from 'types/course/achievements';
import AchievementForm from '../../components/forms/AchievementForm';
import { loadAchievement, updateAchievement } from '../../operations';
import { getAchievementEntity } from '../../selectors';

type Props = WrappedComponentProps;

const translations = defineMessages({
  noAchievement: {
    id: 'course.achievement.edit.noAchievement',
    defaultMessage: 'No Achievement',
  },
  updateSuccess: {
    id: 'course.achievement.update.success',
    defaultMessage: 'Achievement was updated.',
  },
  updateFailure: {
    id: 'course.achievement.update.fail',
    defaultMessage: 'Failed to update achievement.',
  },
});

const AchievementEdit: FC<Props> = (props) => {
  const { intl } = props;
  const courseId = getCourseId();
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { achievementId } = useParams();
  const achievement = useSelector((state: AppState) =>
    getAchievementEntity(state, +achievementId!),
  );

  useEffect(() => {
    if (achievementId) {
      dispatch(loadAchievement(+achievementId)).finally(() =>
        setIsLoading(false),
      );
    }
  }, [dispatch, achievementId]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (!achievement) {
    return (
      <Typography variant="h5">
        {intl.formatMessage(translations.noAchievement)}
      </Typography>
    );
  }

  const onSubmit = (data: AchievementEditFormData, setError): Promise<void> =>
    dispatch(updateAchievement(data.id, data))
      .then(() => {
        toast.success(intl.formatMessage(translations.updateSuccess));
        setTimeout(() => {
          navigate(`/courses/${getCourseId()}/achievements`);
        }, 500);
      })
      .catch((error) => {
        toast.error(intl.formatMessage(translations.updateFailure));
        if (error.response?.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
        throw error;
      });

  const initialValues = {
    id: achievement.id,
    title: achievement.title,
    description: achievement.description,
    published: achievement.published,
    badge: {
      name: achievement.badge?.name,
      url: achievement.badge?.url,
      file: '',
    },
  };

  return (
    <>
      <PageHeader
        title={`Edit Achievement - ${achievement.title}`}
        returnLink={`/courses/${courseId}/achievements/`}
      />
      <AchievementForm
        conditionAttributes={{
          enabledConditions: achievement.enabledConditions,
          conditions: achievement.conditions,
        }}
        editing
        handleClose={(isDirty): void => {
          if (isDirty) {
            setConfirmationDialogOpen(true);
          }
        }}
        initialValues={initialValues}
        onSubmit={onSubmit}
      />
      <ConfirmationDialog
        confirmDiscard
        open={confirmationDialogOpen}
        onCancel={(): void => setConfirmationDialogOpen(false)}
        onConfirm={(): void => {
          setConfirmationDialogOpen(false);
        }}
      />
    </>
  );
};

export default injectIntl(AchievementEdit);
