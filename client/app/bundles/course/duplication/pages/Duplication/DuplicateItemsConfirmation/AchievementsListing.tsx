import { FC } from 'react';
import {
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  ListSubheader,
} from '@mui/material';

import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import { selectDuplicationStore } from 'course/duplication/selectors';
import { DuplicationAchievementData } from 'course/duplication/types';
import { getAchievementBadgeUrl } from 'course/helper/achievements';
import componentTranslations from 'course/translations';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

const renderRow = (achievement: DuplicationAchievementData): JSX.Element => (
  <FormControlLabel
    key={`achievement_${achievement.id}`}
    className="flex items-center w-auto"
    control={<Checkbox checked />}
    label={
      <span className="flex items-center">
        <TypeBadge itemType="ACHIEVEMENT" />
        <UnpublishedIcon tooltipId="itemUnpublished" />
        <img
          alt={achievement.title}
          className="max-h-6 max-w-6 mr-1"
          src={getAchievementBadgeUrl(achievement.url, true)}
        />
        {achievement.title}
      </span>
    }
  />
);

const AchievementsListing: FC = () => {
  const { achievementsComponent, selectedItems } = useAppSelector(
    selectDuplicationStore,
  );
  const { t } = useTranslation();

  const selected = achievementsComponent.filter(
    (a) => selectedItems.ACHIEVEMENT[a.id],
  );
  if (selected.length < 1) return null;

  return (
    <>
      <ListSubheader disableSticky>
        {t(componentTranslations.course_achievements_component)}
      </ListSubheader>
      <Card>
        <CardContent>{selected.map(renderRow)}</CardContent>
      </Card>
    </>
  );
};

export default AchievementsListing;
