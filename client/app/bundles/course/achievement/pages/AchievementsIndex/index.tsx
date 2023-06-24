import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { toast } from 'react-toastify';

import AddButton from 'lib/components/core/buttons/AddButton';
import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
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
    id: 'course.achievement.AchievementsIndex.newAchievement',
    defaultMessage: 'New Achievement',
  },
  fetchAchievementsFailure: {
    id: 'course.achievement.AchievementsIndex.fetchAchievementsFailure',
    defaultMessage: 'Failed to retrieve achievements.',
  },
  toggleSuccess: {
    id: 'course.achievement.AchievementsIndex.toggleSuccess',
    defaultMessage: 'Achievement was updated.',
  },
  toggleFailure: {
    id: 'course.achievement.AchievementsIndex.toggleFailure',
    defaultMessage: 'Failed to update achievement.',
  },
  achievements: {
    id: 'course.achievement.AchievementsIndex.achievements',
    defaultMessage: 'Achievements',
  },
});

const AchievementsIndex: FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const achievements = useAppSelector(getAllAchievementMiniEntities);
  const achievementPermissions = useAppSelector(getAchievementPermissions);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchAchievements())
      .finally(() => setIsLoading(false))
      .catch(() => toast.error(t(translations.fetchAchievementsFailure)));
  }, [dispatch]);

  const headerToolbars: ReactElement[] = []; // To Add: Reorder Button

  if (achievementPermissions?.canReorder) {
    headerToolbars.push(
      <AchievementReordering
        key="achievementReorderingButton"
        handleReordering={(state: boolean): void => {
          setIsReordering(state);
        }}
        isReordering={isReordering}
      />,
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
    <Page
      actions={headerToolbars}
      title={t(translations.achievements)}
      unpadded
    >
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
            isReordering={isReordering}
            onTogglePublished={onTogglePublished}
            permissions={achievementPermissions}
          />
        </>
      )}
    </Page>
  );
};

const handle = translations.achievements;

export default Object.assign(AchievementsIndex, { handle });
