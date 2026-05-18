import { FC, useEffect } from 'react';
import { defineMessages } from 'react-intl';
import {
  Alert,
  FormControlLabel,
  ListSubheader,
  Paper,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';

import { fetchObjectsList } from 'course/duplication/operations';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { actions } from 'course/duplication/store';
import { DuplicationMode } from 'course/duplication/types';
import Page from 'lib/components/core/layouts/Page';
import Link from 'lib/components/core/Link';
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
    defaultMessage: 'Duplicate Data',
  },
  fromCourse: {
    id: 'course.duplication.Duplication.fromCourse',
    defaultMessage: 'Duplicate data from {courseTitle}',
  },
  toCourse: {
    id: 'course.duplication.Duplication.toCourse',
    defaultMessage: 'To',
  },
  items: {
    id: 'course.duplication.Duplication.items',
    defaultMessage: 'Selected Items',
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
  cannotDuplicateToNewCourseInThisInstance: {
    id: 'course.duplication.Duplication.cannotDuplicateToNewCourseInThisInstance',
    defaultMessage:
      'You cannot duplicate to a new course in {instanceHost} because you are not an instructor here. {duplicationLink}',
  },
  requestInstanceInstructorRole: {
    id: 'course.duplication.Duplication.requestInstanceInstructorRole',
    defaultMessage: 'Request to be an instructor',
  },
});

const DuplicationModeSelector: FC<{
  duplicationMode: DuplicationMode;
  modesAllowed: DuplicationMode[];
}> = ({ duplicationMode, modesAllowed }) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const singleValidMode =
    modesAllowed && modesAllowed.length === 1 && modesAllowed[0];

  useEffect(() => {
    if (singleValidMode) {
      dispatch(actions.setDuplicationMode(singleValidMode));
    }
  }, [singleValidMode]);

  return (
    <>
      <Typography className="pt-5 px-6 pb-0" variant="h6">
        {t(translations.toCourse)}
      </Typography>
      <RadioGroup
        className="px-6 mt-6"
        name="duplicationMode"
        onChange={(_, mode) => dispatch(actions.setDuplicationMode(mode))}
        value={duplicationMode}
      >
        <FormControlLabel
          key="COURSE"
          control={<Radio className="py-0" />}
          disabled={!modesAllowed.includes('COURSE')}
          label={t(translations.newCourse)}
          value="COURSE"
        />
        <FormControlLabel
          key="OBJECT"
          control={<Radio className="py-0" />}
          disabled={!modesAllowed.includes('OBJECT')}
          label={t(translations.existingCourse)}
          value="OBJECT"
        />
      </RadioGroup>
    </>
  );
};

const ItemsSelectorSidebar: FC = () => {
  const { duplicationMode, destinationCourseId } = useAppSelector(
    selectDuplicationStore,
  );
  const { t } = useTranslation();

  const isCourseSelected = !!destinationCourseId;

  if (duplicationMode === 'OBJECT' && isCourseSelected) {
    return (
      <div>
        <Typography className="pt-5 px-6 pb-0" variant="h6">
          {t(translations.items)}
        </Typography>
        <ItemsSelectorMenu />
      </div>
    );
  }
  return null;
};

const DuplicationBody: FC = () => {
  const {
    isLoading,
    sourceCourse: { duplicationModesAllowed, enabledComponents },
    destinationCourseId,
    duplicationMode,
    metadata: { currentInstanceId, currentInstanceHost },
    destinationInstances,
  } = useAppSelector(selectDuplicationStore);
  const { t } = useTranslation();

  const isCourseSelected = !!destinationCourseId;
  const modesAllowed = duplicationModesAllowed.filter(
    (mode) => Object.keys(destinationInstances).length > 0 || mode === 'OBJECT',
  );

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (!modesAllowed || modesAllowed.length < 1) {
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
    <>
      {!(currentInstanceId in destinationInstances) && (
        <Alert severity="warning">
          {t(translations.cannotDuplicateToNewCourseInThisInstance, {
            instanceHost: currentInstanceHost,
            duplicationLink: (
              <>
                <br />
                <Link
                  opensInNewTab
                  to="/courses?request_instructor=true"
                  underline="always"
                >
                  {t(translations.requestInstanceInstructorRole)}
                </Link>
              </>
            ),
          })}
        </Alert>
      )}
      <div className="grid grid-cols-[210px_auto]">
        <div className="flex flex-col">
          <DuplicationModeSelector
            duplicationMode={duplicationMode}
            modesAllowed={modesAllowed}
          />
          {duplicationMode === 'COURSE' && (
            <div className="mt-auto my-4">
              <DuplicateAllButton />
            </div>
          )}
        </div>

        <div>
          <Paper className="px-8 pb-6 my-4" variant="outlined">
            <DestinationCourseSelector />
          </Paper>
        </div>

        <div className="py-6">
          <ItemsSelectorSidebar />
        </div>

        <div>
          {duplicationMode === 'OBJECT' && isCourseSelected && (
            <Paper className="h-full px-8 my-4" variant="outlined">
              <ItemsSelector />
            </Paper>
          )}
        </div>
      </div>
    </>
  );
};

const DuplicationPage: FC = () => {
  const { sourceCourse } = useAppSelector(selectDuplicationStore);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(fetchObjectsList());
  }, [dispatch]);

  return (
    <Page
      title={t(translations.fromCourse, {
        courseTitle: sourceCourse.title,
      })}
    >
      <DuplicationBody />
    </Page>
  );
};

const handle = translations.duplicateData;

export default Object.assign(DuplicationPage, { handle });
