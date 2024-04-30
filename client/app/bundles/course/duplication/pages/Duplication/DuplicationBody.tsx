import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { ListSubheader, Paper } from '@mui/material';

import { duplicationModes } from 'course/duplication/constants';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import CourseSidebar from './CourseSidebar';
import DestinationCourseSelector from './DestinationCourseSelector';
import ItemsSelector from './ItemsSelector';
import ItemsSelectorSidebar from './ItemsSelectorSidebar';

const translations = defineMessages({
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
});

const DuplicationBody: FC = () => {
  const { t } = useTranslation();

  const duplication = useAppSelector(selectDuplicationStore);
  const {
    destinationCourseId,
    sourceCourse: { duplicationModesAllowed, enabledComponents },
    duplicationMode,
    isLoading,
  } = duplication;

  const isCourseSelected = !!destinationCourseId;

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

export default DuplicationBody;
