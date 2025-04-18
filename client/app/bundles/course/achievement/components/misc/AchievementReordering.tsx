import { defineMessages } from 'react-intl';
import { Button } from '@mui/material';

import CourseAPI from 'api/course';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

require('jquery-ui/ui/widgets/sortable');

interface AchievementReorderingProps {
  handleReordering: (state: boolean) => void;
  isReordering: boolean;
}

const styles = {
  AchievementReorderingButton: {
    fontSize: 14,
    marginRight: 12,
  },
};

const translations = defineMessages({
  startReorderAchievement: {
    id: 'course.achievement.AchievementReordering.startReorderAchievement',
    defaultMessage: 'Reorder',
  },
  endReorderAchievement: {
    id: 'course.achievement.AchievementReordering.endReorderAchievement',
    defaultMessage: 'Done reordering',
  },
  updateFailed: {
    id: 'course.achievement.AchievementReordering.updateFailed',
    defaultMessage: 'Reorder Failed.',
  },
  updateSuccess: {
    id: 'course.achievement.AchievementReordering.updateSuccess',
    defaultMessage: 'Achievements successfully reordered',
  },
});

// Serialise the ordered achievements as data for the API call.
function serializedOrdering(): string {
  const options = { attribute: 'achievementid', key: 'achievement_order[]' };
  return $('tbody').first().sortable('serialize', options);
}

const AchievementReordering = (
  props: AchievementReorderingProps,
): JSX.Element => {
  const { handleReordering, isReordering } = props;

  const { t } = useTranslation();

  async function submitReordering(ordering: string): Promise<void> {
    try {
      await CourseAPI.achievements.reorder(ordering);
      toast.success(t(translations.updateSuccess));
    } catch {
      toast.error(t(translations.updateFailed));
    }
  }

  return (
    <Button
      key="achievement-reordering-button"
      className="achievement-reordering-button"
      color="primary"
      onClick={(): void => {
        if (isReordering) {
          $('tbody').first().sortable({ disabled: true });
          handleReordering(false);
        } else {
          $('tbody')
            .first()
            .sortable({
              update() {
                const ordering = serializedOrdering();
                submitReordering(ordering);
              },
              disabled: false,
            });
          handleReordering(true);
        }
      }}
      style={styles.AchievementReorderingButton}
      variant={isReordering ? 'contained' : 'outlined'}
    >
      {isReordering
        ? t(translations.endReorderAchievement)
        : t(translations.startReorderAchievement)}
    </Button>
  );
};

export default AchievementReordering;
