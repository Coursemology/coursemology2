import { FC, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { toast } from 'react-toastify';
import { Button } from '@mui/material';

import axios from 'lib/axios';

require('jquery-ui/ui/widgets/sortable');

type Props = WrappedComponentProps;

const styles = {
  AchievementReorderingButton: {
    background: 'white',
    fontSize: 14,
    marginRight: 12,
  },
};

const translations = defineMessages({
  startReorderAchievement: {
    id: 'course.achievement.achievementReorder.startReorderAchievement',
    defaultMessage: 'Start Re-ordering Achievement',
  },
  endReorderAchievement: {
    id: 'course.achievement.achievementReorder.endReorderAchievement',
    defaultMessage: 'End Re-ordering Achievement',
  },
  updateFailed: {
    id: 'course.achievement.achievementReorder.updateFailed',
    defaultMessage: 'Reorder Failed.',
  },
  updateSuccess: {
    id: 'course.achievement.achievementReorder.updateSuccess',
    defaultMessage: 'Achievements successfully reordered',
  },
});

// Serialise the ordered achievements as data for the API call.
function serializedOrdering(): string {
  const options = { attribute: 'achievementid', key: 'achievement_order[]' };
  const ordering = $('tbody').first().sortable('serialize', options);

  return ordering;
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
  const { intl } = props;
  const [isReordering, setIsReordering] = useState(false);

  return (
    <Button
      key="achievement-reordering-button"
      className="achievement-reordering-button"
      color="primary"
      onClick={(): void => {
        if (isReordering) {
          $('tbody').first().sortable({ disabled: true });
          setIsReordering(false);
          $('.fa-reorder').addClass('hidden');
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
          $('.fa-reorder').removeClass('hidden');
          setIsReordering(true);
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
