import { FC } from 'react';
import { Typography } from '@mui/material';

import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { defaultComponentTitles } from 'course/translations.intl';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import AchievementBody from './AchievementBody';

const AchievementsSelector: FC = () => {
  const { t } = useTranslation();
  const duplication = useAppSelector(selectDuplicationStore);

  const { achievementsComponent: achievements } = duplication;

  if (!achievements) {
    return null;
  }

  return (
    <div className="mt-1 space-y-2">
      <Typography className="mt-3 mb-1" variant="h6">
        {t(defaultComponentTitles.course_achievements_component)}
      </Typography>
      <AchievementBody achievements={achievements} />
    </div>
  );
};

export default AchievementsSelector;
