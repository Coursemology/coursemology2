import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { ListSubheader, Typography } from '@mui/material';
import { AppDispatch } from 'store';

import BulkSelectors from 'course/duplication/components/BulkSelectors';
import IndentedCheckbox from 'course/duplication/components/IndentedCheckbox';
import TypeBadge from 'course/duplication/components/TypeBadge';
import UnpublishedIcon from 'course/duplication/components/UnpublishedIcon';
import { duplicableItemTypes } from 'course/duplication/constants';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { actions } from 'course/duplication/store';
import { Achievement } from 'course/duplication/types';
import { getAchievementBadgeUrl } from 'course/helper/achievements';
import { defaultComponentTitles } from 'course/translations.intl';
import Thumbnail from 'lib/components/core/Thumbnail';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  noItems: {
    id: 'course.duplication.Duplication.ItemsSelector.AchievementsSelector.noItems',
    defaultMessage: 'There are no achievements to duplicate.',
  },
});

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

const setAllAchievementSelection = (
  achievements: Achievement[],
  dispatch: AppDispatch,
  value: boolean,
): void => {
  achievements.forEach((achievement) => {
    dispatch(
      actions.setItemSelectedBoolean(
        duplicableItemTypes.ACHIEVEMENT,
        achievement.id,
        value,
      ),
    );
  });
};

interface BodyProps {
  achievements: Achievement[];
}

const AchievementSelectorBody: FC<BodyProps> = (props) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { achievements } = props;
  if (achievements.length < 1) {
    return (
      <ListSubheader disableSticky>{t(translations.noItems)}</ListSubheader>
    );
  }

  const setAllAchievementSelectionValues = (value: boolean): void =>
    setAllAchievementSelection(achievements, dispatch, value);

  return (
    <>
      {achievements.length > 1 ? (
        <BulkSelectors
          callback={setAllAchievementSelectionValues}
          selectLinkClassName="ml-0 leading-6"
        />
      ) : null}
      {achievements.map((achievement) => (
        <AchievementRow key={achievement.id} achievement={achievement} />
      ))}
    </>
  );
};

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
      <AchievementSelectorBody achievements={achievements} />
    </div>
  );
};

export default AchievementsSelector;
