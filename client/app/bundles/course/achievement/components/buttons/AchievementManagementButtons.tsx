import { FC, useState } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AchievementMiniEntity } from 'types/course/achievements';
import { AppDispatch } from 'types/store';
import DeleteButton from 'lib/components/buttons/DeleteButton';
import EditButton from 'lib/components/buttons/EditButton';
import { getCourseId } from 'lib/helpers/url-helpers';
import { getAchievementURL } from 'lib/helpers/url-builders';
import { deleteAchievement } from '../../operations';
import AwardButton from './AwardButton';

interface Props {
  achievement: AchievementMiniEntity;
  navigateToIndex: boolean;
  intl?: any;
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
  automaticAward: {
    id: 'course.achievement.award.automatic',
    defaultMessage:
      'Automatically-awarded achievements cannot be manually awarded to students.',
  },
});

const AchievementManagementButtons: FC<Props> = (props) => {
  const { achievement, intl, navigateToIndex } = props;
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const onEdit = (): void => {
    navigate(`${getAchievementURL(getCourseId(), achievement.id)}/edit`);
  };

  const onDelete = (): Promise<void> => {
    setIsDeleting(true);
    return dispatch(deleteAchievement(achievement.id))
      .then(() => {
        toast.success(intl.formatMessage(translations.deletionSuccess));
        if (navigateToIndex) {
          navigate(`/courses/${getCourseId()}/achievements/`);
        }
      })
      .catch((error) => {
        toast.error(intl.formatMessage(translations.deletionFailure));
        throw error;
      })
      .finally(() => setIsDeleting(false));
  };

  const managementButtons = (
    <div style={{ whiteSpace: 'nowrap' }}>
      <AwardButton
        className={`achievement-award-${achievement.id}`}
        achievementId={achievement.id}
        disabled={!achievement.permissions.canAward}
        tooltipText={intl.formatMessage(translations.automaticAward)}
      />
      {achievement.permissions.canEdit && (
        <EditButton
          className={`achievement-edit-${achievement.id}`}
          onClick={onEdit}
        />
      )}
      {achievement.permissions.canDelete && (
        <DeleteButton
          className={`achievement-delete-${achievement.id}`}
          disabled={isDeleting}
          onClick={onDelete}
          withDialog
        />
      )}
    </div>
  );

  return managementButtons;
};

export default injectIntl(AchievementManagementButtons);
