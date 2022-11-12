import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AchievementMiniEntity } from 'types/course/achievements';
import { AppDispatch } from 'types/store';

import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import EditButton from 'lib/components/core/buttons/EditButton';
import { getCourseId } from 'lib/helpers/url-helpers';
import useTranslation from 'lib/hooks/useTranslation';

import { deleteAchievement } from '../../operations';
import AchievementEdit from '../../pages/AchievementEdit';

import AwardButton from './AwardButton';

interface Props {
  achievement: AchievementMiniEntity;
  navigateToIndex: boolean;
}

const translations = defineMessages({
  deletionSuccess: {
    id: 'course.achievement.delete.success',
    defaultMessage: 'Achievement was deleted.',
  },
  deletionFailure: {
    id: 'course.achievement.delete.fail',
    defaultMessage: 'Failed to delete achievement.',
  },
  deletionConfirm: {
    id: 'course.achievement.delete.confirm',
    defaultMessage: 'Are you sure you wish to delete this achievement?',
  },
  automaticAward: {
    id: 'course.achievement.award.automatic',
    defaultMessage:
      'Automatically-awarded achievements cannot be manually awarded to students.',
  },
});

const AchievementManagementButtons: FC<Props> = (props) => {
  const { achievement, navigateToIndex } = props;
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const onDelete = (): Promise<void> => {
    setIsDeleting(true);
    return dispatch(deleteAchievement(achievement.id))
      .then(() => {
        toast.success(t(translations.deletionSuccess));
        if (navigateToIndex) {
          navigate(`/courses/${getCourseId()}/achievements`);
        }
      })
      .catch((error) => {
        toast.error(t(translations.deletionFailure));
        throw error;
      })
      .finally(() => setIsDeleting(false));
  };

  return (
    <div style={{ whiteSpace: 'nowrap' }}>
      <AwardButton
        achievementId={achievement.id}
        className={`achievement-award-${achievement.id}`}
        disabled={!achievement.permissions.canAward}
        tooltipText={t(translations.automaticAward)}
      />
      {achievement.permissions.canEdit && (
        <>
          <EditButton
            className={`achievement-edit-${achievement.id}`}
            onClick={(): void => setIsEditing(true)}
          />
          {isEditing && (
            <AchievementEdit
              achievementId={achievement.id}
              onClose={(): void => setIsEditing(false)}
              open={isEditing}
            />
          )}
        </>
      )}
      {achievement.permissions.canDelete && (
        <DeleteButton
          className={`achievement-delete-${achievement.id}`}
          confirmMessage={t(translations.deletionConfirm)}
          disabled={isDeleting}
          loading={isDeleting}
          onClick={onDelete}
        />
      )}
    </div>
  );
};

export default AchievementManagementButtons;
