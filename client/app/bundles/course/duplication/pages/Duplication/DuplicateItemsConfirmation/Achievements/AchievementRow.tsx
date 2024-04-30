import { FC } from 'react';
import { Checkbox, FormControlLabel, Typography } from '@mui/material';

import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import { duplicableItemTypes } from 'course/duplication/constants';
import { Achievement } from 'course/duplication/types';
import { getAchievementBadgeUrl } from 'course/helper/achievements';

interface AchievementRowProps {
  key: string;
  achievement: Achievement;
}

const AchievementRow: FC<AchievementRowProps> = (props) => {
  const { key, achievement } = props;

  return (
    <FormControlLabel
      key={key}
      className="flex items-center w-auto"
      control={<Checkbox checked />}
      label={
        <span className="flex flex-row items-center">
          <TypeBadge itemType={duplicableItemTypes.ACHIEVEMENT} />
          <UnpublishedIcon tooltipId="itemUnpublished" />
          <img
            alt={getAchievementBadgeUrl(achievement.url, true)}
            className="max-h-6 max-w-6 mr-1.5"
            src={getAchievementBadgeUrl(achievement.url, true)}
          />
          <Typography className="font-bold">{achievement.title}</Typography>
        </span>
      }
    />
  );
};

export default AchievementRow;
