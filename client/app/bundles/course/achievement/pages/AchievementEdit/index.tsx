import { FC, useEffect } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch, AppState } from 'types/store';

import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import useTranslation from 'lib/hooks/useTranslation';

import AchievementForm from '../../components/forms/AchievementForm';
import { loadAchievement, updateAchievement } from '../../operations';
import { getAchievementEntity } from '../../selectors';

interface Props {
  achievementId: number;
  open: boolean;
  onClose: () => void;
}

const translations = defineMessages({
  editAchievement: {
    id: 'course.achievement.edit.editAchievement',
    defaultMessage: 'Edit Achievement',
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
  const { achievementId, open, onClose } = props;
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const achievement = useSelector((state: AppState) =>
    getAchievementEntity(state, achievementId!),
  );

  useEffect(() => {
    dispatch(loadAchievement(achievementId));
  }, [dispatch, achievementId]);

  if (!achievement) {
    return null;
  }

  const onSubmit = (data, setError): Promise<void> =>
    dispatch(updateAchievement(data.id, data))
      .then(() => {
        toast.success(t(translations.updateSuccess));
        setTimeout(() => {
          onClose();
          // window.location.reload();
        }, 500);
      })
      .catch((error) => {
        toast.error(t(translations.updateFailure));
        if (error.response?.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
      });

  const initialValues = {
    id: achievement.id,
    title: achievement.title,
    description: achievement.description,
    published: achievement.published,
    badge: {
      name: achievement.badge?.name,
      url: achievement.badge?.url,
      file: undefined,
    },
  };

  return (
    <AchievementForm
      conditionAttributes={achievement.conditionsData}
      editing
      initialValues={initialValues}
      onClose={onClose}
      onSubmit={onSubmit}
      open={open}
      title={t(translations.editAchievement)}
    />
  );
};

export default AchievementEdit;
