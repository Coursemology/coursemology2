import { FC, useEffect } from 'react';
import { defineMessages } from 'react-intl';

import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { getCourseId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import AchievementForm from '../../components/forms/AchievementForm';
import { loadAchievement, updateAchievement } from '../../operations';
import { getAchievementEntity } from '../../selectors';

interface Props {
  achievementId: number;
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const translations = defineMessages({
  editAchievement: {
    id: 'course.achievement.AchievementEdit.editAchievement',
    defaultMessage: 'Edit Achievement',
  },
  updateSuccess: {
    id: 'course.achievement.AchievementEdit.updateSuccess',
    defaultMessage: 'Achievement was updated.',
  },
  updateFailure: {
    id: 'course.achievement.AchievementEdit.updateFailure',
    defaultMessage: 'Failed to update achievement.',
  },
});

const AchievementEdit: FC<Props> = (props) => {
  const { achievementId, open, onClose, onSubmit } = props;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const achievement = useAppSelector((state) =>
    getAchievementEntity(state, achievementId!),
  );

  useEffect(() => {
    dispatch(loadAchievement(achievementId));
  }, [dispatch, achievementId]);

  if (!achievement) {
    return null;
  }

  const onSubmitWrapped = (data, setError): Promise<void> =>
    dispatch(updateAchievement(data.id, data))
      .then(() => {
        toast.success(t(translations.updateSuccess));
        onSubmit();
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
      name: achievement.badge.name,
      url: achievement.badge.url,
      file: undefined,
    },
  };

  return (
    <AchievementForm
      conditionAttributes={achievement.conditionsData}
      editing
      initialValues={initialValues}
      onClose={onClose}
      onSubmit={onSubmitWrapped}
      open={open}
      title={t(translations.editAchievement)}
    />
  );
};

export default AchievementEdit;
