import { FC, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

import { BUFFER_TIME_TO_FORCE_SUBMIT_MS } from '../constants';
import { remainingTimeDisplay } from '../pages/SubmissionEditIndex/TimeLimitBanner';
import translations from '../translations';

interface Props {
  deadline: number;
  isExamMode: boolean;
  isTimedMode: boolean;
  isAttempting: boolean;
}

const WarningDialog: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { isExamMode, isTimedMode, isAttempting, deadline } = props;

  const [examNotice, setExamNotice] = useState(isExamMode);
  const [timedNotice, setTimedNotice] = useState(isTimedMode);

  const remainingTime =
    deadline && new Date(deadline) > new Date()
      ? new Date(deadline).getTime() - new Date().getTime()
      : null;

  const remainingBufferTime =
    deadline &&
    new Date(deadline) <= new Date() &&
    new Date(deadline + BUFFER_TIME_TO_FORCE_SUBMIT_MS) > new Date()
      ? new Date(deadline).getTime() +
        BUFFER_TIME_TO_FORCE_SUBMIT_MS -
        new Date().getTime()
      : null;

  let dialogTitle: string = '';
  let dialogMessage: string = '';

  if (examNotice && timedNotice) {
    dialogTitle = t(translations.timedExamDialogTitle, {
      remainingTime: remainingTimeDisplay(remainingTime ?? 0),
      stillSomeTimeRemaining: !!remainingTime,
    });
    dialogMessage = t(translations.timedExamDialogMessage, {
      stillSomeTimeRemaining: !!remainingTime,
      remainingBufferTime: remainingTimeDisplay(remainingBufferTime ?? 0),
    });
  } else if (examNotice) {
    dialogTitle = t(translations.examDialogTitle);
    dialogMessage = t(translations.examDialogMessage);
  } else if (timedNotice) {
    dialogTitle = t(translations.timedAssessmentDialogTitle, {
      remainingTime: remainingTimeDisplay(remainingTime ?? 0),
      stillSomeTimeRemaining: !!remainingTime,
    });
    dialogMessage = t(translations.timedAssessmentDialogMessage, {
      stillSomeTimeRemaining: !!remainingTime,
      remainingBufferTime: remainingTimeDisplay(remainingBufferTime ?? 0),
    });
  }

  return (
    <Dialog maxWidth="lg" open={isAttempting && (examNotice || timedNotice)}>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" variant="body2">
          {dialogMessage}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          color="primary"
          onClick={() => {
            setExamNotice(false);
            setTimedNotice(false);
          }}
        >
          {t(translations.ok)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WarningDialog;
