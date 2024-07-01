import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Typography } from '@mui/material';

import { duplicationModes } from 'course/duplication/constants';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { actions } from 'course/duplication/store';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import CourseModeSelector from './CourseModeSelector';

const translations = defineMessages({
  toCourse: {
    id: 'course.duplication.Duplication.toCourse',
    defaultMessage: 'To',
  },
});

const CourseSidebar: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const duplication = useAppSelector(selectDuplicationStore);
  const {
    sourceCourse: { duplicationModesAllowed },
  } = duplication;
  const Header = (): JSX.Element => (
    <Typography variant="h6">{t(translations.toCourse)}</Typography>
  );

  const isSingleValidMode =
    duplicationModesAllowed &&
    duplicationModesAllowed.length === 1 &&
    duplicationModes[duplicationModesAllowed[0]];

  if (isSingleValidMode) {
    dispatch(actions.setDuplicationMode(duplicationModesAllowed[0]));
    return <Header />;
  }

  return (
    <div className="flex flex-col">
      <Header />
      <CourseModeSelector />
    </div>
  );
};

export default CourseSidebar;
