import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AppDispatch } from 'types/store';

import { setReactHookFormError } from 'lib/helpers/react-hook-form-helper';
import { getAchievementURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import useTranslation from 'lib/hooks/useTranslation';

import AchievementForm from '../../components/forms/AchievementForm';
import { createAchievement } from '../../operations';

interface Props {
  open: boolean;
  onClose: () => void;
}

const translations = defineMessages({
  newAchievement: {
    id: 'course.achievement.newAchievement',
    defaultMessage: 'New Achievement',
  },
  creationSuccess: {
    id: 'course.achievement.create.success',
    defaultMessage: 'Achievement was created.',
  },
  creationFailure: {
    id: 'course.achievement.create.fail',
    defaultMessage: 'Failed to create achievement.',
  },
});

const initialValues = {
  title: '',
  description: '',
  published: false,
  badge: { name: '', url: '', file: undefined }, // TODO: Pass url for local achievement_blank.png asset
};

const AchievementNew: FC<Props> = (props) => {
  const { open, onClose } = props;
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  if (!open) {
    return null;
  }

  const onSubmit = (data, setError): Promise<void> =>
    dispatch(createAchievement(data))
      .then((response) => {
        toast.success(t(translations.creationSuccess));
        setTimeout(() => {
          if (response.data?.id) {
            navigate(getAchievementURL(getCourseId(), response.data.id));
          }
        }, 200);
      })
      .catch((error) => {
        toast.error(t(translations.creationFailure));
        if (error.response?.data) {
          setReactHookFormError(setError, error.response.data.errors);
        }
      });

  return (
    <AchievementForm
      editing={false}
      initialValues={initialValues}
      onClose={onClose}
      onSubmit={onSubmit}
      open={open}
      title={t(translations.newAchievement)}
    />
  );
};

export default AchievementNew;
