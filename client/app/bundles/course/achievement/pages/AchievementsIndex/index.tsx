import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { AppDispatch, AppState } from 'types/store';

import AddButton from 'lib/components/core/buttons/AddButton';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import PageHeader from 'lib/components/navigation/PageHeader';
import useTranslation from 'lib/hooks/useTranslation';

import AchievementReordering from '../../components/misc/AchievementReordering';
import AchievementTable from '../../components/tables/AchievementTable';
import {
  fetchAchievements,
  updatePublishedAchievement,
} from '../../operations';
import {
  getAchievementPermissions,
  getAllAchievementMiniEntities,
} from '../../selectors';
import AchievementNew from '../AchievementNew';

const translations = defineMessages({
  newAchievement: {
    id: 'course.achievement.new',
    defaultMessage: 'New Achievement',
  },
  fetchAchievementsFailure: {
    id: 'course.achievement.index.fetch.failure',
    defaultMessage: 'Failed to retrieve achievements.',
  },
  toggleSuccess: {
    id: 'course.achievement.toggle.success',
    defaultMessage: 'Achievement was updated.',
  },
  toggleFailure: {
    id: 'course.achievement.toggle.fail',
    defaultMessage: 'Failed to update achievement.',
  },
});

const AchievementsIndex: FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const achievements = useSelector((state: AppState) =>
    getAllAchievementMiniEntities(state),
  );
  const achievementPermissions = useSelector((state: AppState) =>
    getAchievementPermissions(state),
  );
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchAchievements())
      .finally(() => setIsLoading(false))
      .catch(() => toast.error(t(translations.fetchAchievementsFailure)));
  }, [dispatch]);

  const headerToolbars: ReactElement[] = []; // To Add: Reorder Button

  if (achievementPermissions?.canReorder) {
    headerToolbars.push(
      <AchievementReordering key="achievementReorderingButton" />,
    );
  }

  if (achievementPermissions?.canCreate) {
    headerToolbars.push(
      <AddButton
        key="new-achievement-button"
        className="new-achievement-button"
        onClick={(): void => setIsOpen(true)}
        tooltip={t(translations.newAchievement)}
      />,
    );
  }

  const onTogglePublished = (
    achievementId: number,
    data: boolean,
  ): Promise<void> =>
    dispatch(updatePublishedAchievement(achievementId, data))
      .then(() => {
        toast.success(t(translations.toggleSuccess));
      })
      .catch(() => {
        toast.error(t(translations.toggleFailure));
      });

  return (
    <>
      <PageHeader
        title={t({
          id: 'course.achievement.header',
          defaultMessage: 'Achievements',
        })}
        toolbars={headerToolbars}
      />
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <>
          <AchievementNew
            onClose={(): void => setIsOpen(false)}
            open={isOpen}
          />
          <AchievementTable
            achievements={achievements}
            onTogglePublished={onTogglePublished}
            permissions={achievementPermissions}
          />
        </>
      )}
    </>
  );
};

export default AchievementsIndex;
