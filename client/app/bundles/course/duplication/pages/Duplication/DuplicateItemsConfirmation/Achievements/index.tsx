import { FC } from 'react';
import { Card, CardContent, ListSubheader, Typography } from '@mui/material';

import { duplicableItemTypes } from 'course/duplication/constants';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { Achievement } from 'course/duplication/types';
import { defaultComponentTitles } from 'course/translations.intl';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import AchievementRow from './AchievementRow';

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
