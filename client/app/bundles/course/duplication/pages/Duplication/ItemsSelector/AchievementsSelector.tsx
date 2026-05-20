import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { ListSubheader, Typography } from '@mui/material';

import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import { selectDuplicationStore } from 'course/duplication/selectors';
import { actions } from 'course/duplication/store';
import { DuplicationAchievementData } from 'course/duplication/types';
import { getAchievementBadgeUrl } from 'course/helper/achievements';
import componentTranslations from 'course/translations';
import BulkSelectors from 'lib/components/core/BulkSelectors';
import IndentedCheckbox from 'lib/components/core/IndentedCheckbox';
import Thumbnail from 'lib/components/core/Thumbnail';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  noItems: {
    id: 'course.duplication.Duplication.ItemsSelector.AchievementsSelector.noItems',
    defaultMessage: 'There are no achievements to duplicate.',
  },
});

const AchievementsSelector: FC = () => {
  const { achievementsComponent: achievements, selectedItems } = useAppSelector(
    selectDuplicationStore,
  );
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  if (!achievements) return null;

  const setAllAchievementsSelection = (value: boolean): void => {
    achievements.forEach((achievement) => {
      dispatch(
        actions.setItemSelectedBoolean('ACHIEVEMENT', achievement.id, value),
      );
    });
  };

  const renderRow = (achievement: DuplicationAchievementData): JSX.Element => {
    const checked = !!selectedItems.ACHIEVEMENT[achievement.id];
    return (
      <IndentedCheckbox
        key={achievement.id}
        checked={checked}
        label={
          <span className="flex items-center">
            <TypeBadge itemType="ACHIEVEMENT" />
            {achievement.published || <UnpublishedIcon />}
            <Thumbnail
              rootStyle={{
                zIndex: 3,
                position: 'relative',
                display: 'inline-block',
                marginRight: 5,
              }}
              src={getAchievementBadgeUrl(achievement.url, true)}
              style={{ maxHeight: 24, maxWidth: 24 }}
            />
            {achievement.title}
          </span>
        }
        onChange={(_, value) =>
          dispatch(
            actions.setItemSelectedBoolean(
              'ACHIEVEMENT',
              achievement.id,
              value,
            ),
          )
        }
      />
    );
  };

  const renderBody = (): JSX.Element => {
    if (achievements.length < 1) {
      return (
        <ListSubheader disableSticky>{t(translations.noItems)}</ListSubheader>
      );
    }
    return (
      <>
        {achievements.length > 1 && (
          <BulkSelectors
            callback={setAllAchievementsSelection}
            styles={{ selectLink: { marginLeft: 0 } }}
          />
        )}
        {achievements.map(renderRow)}
      </>
    );
  };

  return (
    <>
      <Typography className="mt-5 mb-5" variant="h2">
        {t(componentTranslations.course_achievements_component)}
      </Typography>
      {renderBody()}
    </>
  );
};

export default AchievementsSelector;
