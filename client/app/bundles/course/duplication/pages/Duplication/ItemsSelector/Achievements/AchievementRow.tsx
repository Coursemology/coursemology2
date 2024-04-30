import { FC } from 'react';
import { Typography } from '@mui/material';

import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import { duplicableItemTypes } from 'course/duplication/constants';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { actions } from 'course/duplication/store';
import { Achievement } from 'course/duplication/types';
import { getAchievementBadgeUrl } from 'course/helper/achievements';
import Thumbnail from 'lib/components/core/Thumbnail';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';

interface RowProps {
  achievement: Achievement;
}

const styles = {
  badge: {
    maxHeight: 24,
    maxWidth: 24,
  },
  badgeContainer: {
    zIndex: 3,
    position: 'relative',
    display: 'inline-block',
    marginRight: 5,
  },
};

const AchievementRow: FC<RowProps> = (props) => {
  const { achievement } = props;
  const dispatch = useAppDispatch();
  const duplication = useAppSelector(selectDuplicationStore);

  const { selectedItems } = duplication;

  const checked =
    !!selectedItems[duplicableItemTypes.ACHIEVEMENT][achievement.id];
  const label = (
    <span className="flex flex-row items-center">
      <TypeBadge itemType={duplicableItemTypes.ACHIEVEMENT} />
      {achievement.published || <UnpublishedIcon />}
      <Thumbnail
        rootStyle={styles.badgeContainer}
        src={getAchievementBadgeUrl(achievement.url, true)}
        style={styles.badge}
      />
      <Typography className="font-bold">{achievement.title}</Typography>
    </span>
  );
  return (
    <IndentedCheckbox
      key={achievement.id}
      checked={checked}
      indentLevel={0}
      label={label}
      onChange={(_, value) =>
        dispatch(
          actions.setItemSelectedBoolean(
            duplicableItemTypes.ACHIEVEMENT,
            achievement.id,
            value,
          ),
        )
      }
    />
  );
};

export default AchievementRow;
