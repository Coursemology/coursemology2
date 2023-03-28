import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { toast } from 'react-toastify';
import { Button } from '@mui/material';

import axios from 'lib/axios';

require('jquery-ui/ui/widgets/sortable');

interface Props extends WrappedComponentProps {
  handleReordering: (state: boolean) => void;
  isReordering: boolean;
}

const styles = {
  AchievementReorderingButton: {
    background: 'white',
    fontSize: 14,
    marginRight: 12,
  },
};

const translations = defineMessages({
  startReorderAchievement: {
    id: 'course.achievement.AchievementReordering.startReorderAchievement',
    defaultMessage: 'Start Re-ordering',
  },
  endReorderAchievement: {
    id: 'course.achievement.AchievementReordering.endReorderAchievement',
    defaultMessage: 'End Re-ordering',
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

function submitReordering(ordering: string): Promise<void> {
  const action = `${window.location.pathname}/reorder`;

  return axios
    .post(action, ordering)
    .then(() => {
      toast.success(translations.updateSuccess.defaultMessage);
    })
    .catch(() => {
      toast.error(translations.updateFailed.defaultMessage);
    });
}

const AchievementReordering: FC<Props> = (props: Props) => {
  const { intl, handleReordering, isReordering } = props;

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
      variant="outlined"
    >
      {isReordering
        ? intl.formatMessage(translations.endReorderAchievement)
        : intl.formatMessage(translations.startReorderAchievement)}
    </Button>
  );
};

export default injectIntl(AchievementReordering);
