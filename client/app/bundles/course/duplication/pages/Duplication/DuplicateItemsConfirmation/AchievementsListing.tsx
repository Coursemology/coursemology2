import { FC } from 'react';
import {
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  ListSubheader,
  Typography,
} from '@mui/material';

import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import { duplicableItemTypes } from 'course/duplication/constants';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { Achievement } from 'course/duplication/types';
import { getAchievementBadgeUrl } from 'course/helper/achievements';
import { defaultComponentTitles } from 'course/translations.intl';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

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

const AchievementsListing: FC = () => {
  const { t } = useTranslation();
  const duplication = useAppSelector(selectDuplicationStore);

  const { achievementsComponent: achievements, selectedItems } = duplication;
  const selectedAchievements = achievements
    ? achievements.filter(
        (achievement: Achievement) =>
          selectedItems[duplicableItemTypes.ACHIEVEMENT][achievement.id],
      )
    : [];

  if (selectedAchievements.length < 1) {
    return null;
  }

  return (
    <div className="mt-3 space-y-3">
      <ListSubheader disableSticky>
        <Typography variant="body2">
          {t(defaultComponentTitles.course_achievements_component)}
        </Typography>
      </ListSubheader>
      <Card>
        <CardContent>
          {selectedAchievements.map((achievement) => (
            <AchievementRow
              key={`achievement_${achievement.id}`}
              achievement={achievement}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementsListing;
