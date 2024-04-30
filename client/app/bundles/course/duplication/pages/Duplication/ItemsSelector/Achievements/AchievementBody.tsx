import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { ListSubheader } from '@mui/material';
import { AppDispatch } from 'store';

import BulkSelectors from 'course/duplication/components/BulkSelectors';
import { duplicableItemTypes } from 'course/duplication/constants';
import { actions } from 'course/duplication/store';
import { Achievement } from 'course/duplication/types';
import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import AchievementRow from './AchievementRow';

interface BodyProps {
  achievements: Achievement[];
}

const translations = defineMessages({
  noItems: {
    id: 'course.duplication.Duplication.ItemsSelector.AchievementsSelector.noItems',
    defaultMessage: 'There are no achievements to duplicate.',
  },
});

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

const AchievementBody: FC<BodyProps> = (props) => {
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

export default AchievementBody;
