import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Button, CircularProgress, Typography } from '@mui/material';

import { selectDuplicationStore } from 'course/duplication/selectors';
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
  const {
    duplicationMode,
    isDuplicating,
    isChangingCourse,
    isDuplicationSuccess,
  } = useAppSelector(selectDuplicationStore);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const disabled = isDuplicating || isChangingCourse || isDuplicationSuccess;

  if (duplicationMode !== 'COURSE') {
    return null;
  }

  return (
    <>
      <div>
        <Button
          color="secondary"
          disabled={disabled}
          endIcon={
            isDuplicating || isDuplicationSuccess ? (
              <CircularProgress size={36} />
            ) : null
          }
          onClick={() => setConfirmationOpen(true)}
          variant="contained"
        >
          {t(translations.duplicateCourse)}
        </Button>
      </div>
      <ConfirmationDialog
        form="new-course-form"
        message={
          <div className="space-y-4">
            <Typography variant="body2">{t(translations.info)}</Typography>
            <Typography variant="body2">
              {t(translations.confirmationMessage)}
            </Typography>
          </div>
        }
        onCancel={() => setConfirmationOpen(false)}
        onConfirm={() => setConfirmationOpen(false)}
        open={confirmationOpen}
      />
    </>
  );
};

export default DuplicateAllButton;
