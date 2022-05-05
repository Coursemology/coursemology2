import { FC, ReactElement, useEffect, useState } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Button } from '@mui/material';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { AppDispatch, AppState } from 'types/store';
import PageHeader from 'lib/components/pages/PageHeader';
import {
  fetchAchievements,
  updatePublishedAchievement,
} from '../../operations';
import {
  getAchievementPermissions,
  getAllAchievementMiniEntities,
} from '../../selectors';
import AchievementTable from '../../components/tables/AchievementTable';
import AchievementNew from '../AchievementNew';
import AchievementReordering from '../../components/misc/AchievementReordering';

interface OwnProps {
  intl?: any;
}

const styles = {
  newButton: {
    background: 'white',
    fontSize: 14,
  },
};

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

const AchievementsIndex: FC<OwnProps> = (props) => {
  const { intl } = props;
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
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchAchievementsFailure)),
      );
  }, [dispatch]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  const headerToolbars: ReactElement[] = []; // To Add: Reorder Button

  if (achievementPermissions && achievementPermissions.canReorder) {
    headerToolbars.push(
      <AchievementReordering key="achievementReorderingButton" />,
    );
  }

  if (achievementPermissions && achievementPermissions.canCreate) {
    headerToolbars.push(
      <Button
        className="new-achievement-button"
        key="new-achievement-button"
        variant="outlined"
        color="primary"
        onClick={() => setIsOpen(true)}
        style={styles.newButton}
      >
        {intl.formatMessage(translations.newAchievement)}
      </Button>,
    );
  }

  const onTogglePublished = (achievementId: number, data: boolean) =>
    dispatch(
      updatePublishedAchievement(
        achievementId,
        data,
        intl.formatMessage(translations.toggleSuccess),
        intl.formatMessage(translations.toggleFailure),
      ),
    );

  return (
    <>
      <PageHeader
        title={intl.formatMessage({
          id: 'course.achievement.header',
          defaultMessage: 'Achievements',
        })}
        toolbars={headerToolbars}
      />
      <AchievementNew open={isOpen} handleClose={() => setIsOpen(false)} />
      <AchievementTable
        achievements={achievements}
        permissions={achievementPermissions}
        onTogglePublished={onTogglePublished}
      />
    </>
  );
};

export default injectIntl(AchievementsIndex);
