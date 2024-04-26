import { FC } from 'react';
import { defineMessages } from 'react-intl';
import {
  FormControlLabel,
  ListSubheader,
  Paper,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';

import { duplicationModes } from 'course/duplication/constants';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { actions } from 'course/duplication/store';
import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import DestinationCourseSelector from './DestinationCourseSelector';
import DuplicateAllButton from './DuplicateAllButton';
import ItemsSelector from './ItemsSelector';
import ItemsSelectorMenu from './ItemsSelectorMenu';

const translations = defineMessages({
  duplicateData: {
    id: 'course.duplication.Duplication.duplicateData',
    defaultMessage: 'Duplicate Data from {courseTitle}',
  },
  fromCourse: {
    id: 'course.duplication.Duplication.fromCourse',
    defaultMessage: 'From',
  },
  toCourse: {
    id: 'course.duplication.Duplication.toCourse',
    defaultMessage: 'To',
  },
  items: {
    id: 'course.duplication.Duplication.items',
    defaultMessage: 'Selected Items',
  },
  startAt: {
    id: 'course.duplication.Duplication.startAt',
    defaultMessage: 'Start Date',
  },
  newCourse: {
    id: 'course.duplication.Duplication.newCourse',
    defaultMessage: 'New Course',
  },
  existingCourse: {
    id: 'course.duplication.Duplication.existingCourse',
    defaultMessage: 'Existing Course',
  },
  duplicationDisabled: {
    id: 'course.duplication.Duplication.duplicationDisabled',
    defaultMessage: 'Duplication is disabled for this course.',
  },
  noComponentsEnabled: {
    id: 'course.duplication.Duplication.noComponentsEnabled',
    defaultMessage:
      'All components with duplicable items are disabled. \
      You may enable them under course settings.',
  },
  selectSourceCourse: {
    id: 'course.duplication.Duplication.selectSourceCourse',
    defaultMessage: 'Select course to duplicate from:',
  },
});

const DuplicationIndex: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const duplication = useAppSelector(selectDuplicationStore);
  const {
    destinationCourseId,
    sourceCourse: { duplicationModesAllowed, enabledComponents },
    duplicationMode,
    isLoading,
    sourceCourse,
  } = duplication;

  const isCourseSelected = !!destinationCourseId;

  const ItemsSelectorSidebar = (): JSX.Element => {
    if (duplicationMode === duplicationModes.COURSE) {
      return <DuplicateAllButton />;
    }

    if (isCourseSelected) {
      return (
        <div>
          <Typography className="py-6 px-5 pt-0" variant="h6">
            {t(translations.items)}
          </Typography>
          <ItemsSelectorMenu />
        </div>
      );
    }

    return <div />;
  };

  const CourseModeSelector = (): JSX.Element => (
    <RadioGroup
      className="mt-4"
      name="duplicationMode"
      onChange={(_, mode) => dispatch(actions.setDuplicationMode(mode))}
      value={duplicationMode}
    >
      <FormControlLabel
        key={duplicationModes.COURSE}
        control={<Radio className="py-0" />}
        label={t(translations.newCourse)}
        value={duplicationModes.COURSE}
      />
      <FormControlLabel
        key={duplicationModes.OBJECT}
        control={<Radio className="py-0" />}
        label={t(translations.existingCourse)}
        value={duplicationModes.OBJECT}
      />
    </RadioGroup>
  );

  const CourseSidebar = (): JSX.Element => {
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

  const DuplicationBody = (): JSX.Element => {
    if (isLoading) {
      return <LoadingIndicator />;
    }

    if (!duplicationModesAllowed || duplicationModesAllowed.length < 1) {
      return (
        <ListSubheader disableSticky>
          {t(translations.duplicationDisabled)}
        </ListSubheader>
      );
    }

    if (!enabledComponents || enabledComponents.length < 1) {
      return (
        <ListSubheader disableSticky>
          {t(translations.noComponentsEnabled)}
        </ListSubheader>
      );
    }

    return (
      <div className="grid grid-cols-[210px_auto]">
        <CourseSidebar />
        <Paper className="mt-4 py-1 px-10 pb-5">
          <DestinationCourseSelector />
        </Paper>
        <ItemsSelectorSidebar />
        {duplicationMode === duplicationModes.OBJECT && isCourseSelected && (
          <Paper className="mt-4 py-1 px-10 pb-5">
            <ItemsSelector />
          </Paper>
        )}
      </div>
    );
  };

  return (
    <Page
      title={t(translations.duplicateData, { courseTitle: sourceCourse.title })}
    >
      <DuplicationBody />
    </Page>
  );
};

export default DuplicationIndex;
