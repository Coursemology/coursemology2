import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Button, CircularProgress, Typography } from '@mui/material';

import { duplicationModes } from 'course/duplication/constants';
import { selectDuplicationStore } from 'course/duplication/selectors/destinationInstance';
import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  duplicateCourse: {
    id: 'course.duplication.Duplication.DuplicateAllButton.duplicateCourse',
    defaultMessage: 'Duplicate Course',
  },
  info: {
    id: 'course.duplication.Duplication.DuplicateAllButton.info',
    defaultMessage:
      'Duplication usually takes some time to complete. \
    You may close the window while duplication is in progress.\
    You will receive an email with a link to the new course when it becomes available.',
  },
  confirmationMessage: {
    id: 'course.duplication.Duplication.DuplicateAllButton.confirmationMessage',
    defaultMessage: 'Proceed with course duplication?',
  },
});

const DuplicateAllButton: FC = () => {
  const { t } = useTranslation();

  const duplication = useAppSelector(selectDuplicationStore);

  const {
    duplicationMode,
    isDuplicating,
    isDuplicationSuccess,
    isChangingCourse,
  } = duplication;
  const disabled = isDuplicating || isChangingCourse || isDuplicationSuccess;

  const [open, setOpen] = useState(false);

  if (duplicationMode !== duplicationModes.COURSE) {
    return null;
  }

  return (
    <>
      <div>
        <Button
          color="secondary"
          disabled={disabled}
          onClick={() => setOpen(true)}
          variant="contained"
        >
          <Typography variant="body2">
            {t(translations.duplicateCourse)}
          </Typography>
        </Button>
        {(isDuplicating || isDuplicationSuccess) && (
          <CircularProgress className="absolute ml-2" size={36} />
        )}
      </div>
      <ConfirmationDialog
        form="new-course-form"
        message={
          <div className="space-y-2">
            <Typography variant="body2">{t(translations.info)}</Typography>
            <Typography variant="body2">
              {t(translations.confirmationMessage)}
            </Typography>
          </div>
        }
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);
        }}
        open={open}
      />
    </>
  );
};

export default DuplicateAllButton;
