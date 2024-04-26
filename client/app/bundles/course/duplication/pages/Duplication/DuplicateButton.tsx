import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Button, Typography } from '@mui/material';

import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import { actions } from 'course/duplication/store';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import DuplicateItemsConfirmation from './DuplicateItemsConfirmation';

const translations = defineMessages({
  duplicateItems: {
    id: 'course.duplication.Duplication.DuplicateButton.duplicateItems',
    defaultMessage: 'Duplicate Items',
  },
  selectCourse: {
    id: 'course.duplication.Duplication.DuplicateButton.selectCourse',
    defaultMessage: 'Select Destination!',
  },
  selectItem: {
    id: 'course.duplication.Duplication.DuplicateButton.selectItem',
    defaultMessage: 'Select An Item!',
  },
});

const DuplicateButton: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const duplication = useAppSelector(selectDuplicationStore);

  const { destinationCourseId, isChangingCourse, selectedItems } = duplication;
  const isCourseSelected = !!destinationCourseId;
  const isItemSelected = Object.values(selectedItems).some((hash) =>
    Object.values(hash as Record<string, unknown>).some((value) => value),
  );

  let label: string;
  if (!isCourseSelected) {
    label = 'selectCourse';
  } else if (!isItemSelected) {
    label = 'selectItem';
  } else {
    label = 'duplicateItems';
  }

  return (
    <>
      <Button
        className="mt-4 w-full"
        color="secondary"
        disabled={!isCourseSelected || !isItemSelected || isChangingCourse}
        onClick={() => dispatch(actions.showDuplicateItemsConfirmation())}
        variant="contained"
      >
        <Typography variant="body2">{t(translations[label])}</Typography>
      </Button>
      <DuplicateItemsConfirmation />
    </>
  );
};

export default DuplicateButton;
