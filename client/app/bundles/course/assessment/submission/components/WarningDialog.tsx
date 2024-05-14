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

import { remainingTimeDisplay } from '../pages/SubmissionEditIndex/TimeLimitBanner';
import translations from '../translations';

interface Props {
  deadline: Date;
  isExamMode: boolean;
  isTimedMode: boolean;
  isAttempting: boolean;
}

const NO_TIME_REMAINING = 'no time';

const WarningDialog: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { isExamMode, isTimedMode, isAttempting, deadline } = props;

  const [examNotice, setExamNotice] = useState(isExamMode);
  const [timedNotice, setTimedNotice] = useState(isTimedMode);

  const remainingTime =
    deadline && new Date(deadline) > new Date()
      ? new Date(deadline).getTime() - new Date().getTime()
      : null;

  let dialogTitle: string = '';
  let dialogMessage: string = '';

  if (examNotice && timedNotice) {
    dialogTitle = t(translations.timedExamDialogTitle);
    dialogMessage = t(translations.timedExamDialogMessage, {
      remainingTime: remainingTime
        ? remainingTimeDisplay(remainingTime)
        : NO_TIME_REMAINING,
      stillSomeTimeRemaining: !!remainingTime,
    });
  } else if (examNotice) {
    dialogTitle = t(translations.examDialogTitle);
    dialogMessage = t(translations.examDialogMessage);
  } else if (timedNotice) {
    dialogTitle = t(translations.timedAssessmentDialogTitle);
    dialogMessage = t(translations.timedAssessmentDialogMessage, {
      remainingTime: remainingTime
        ? remainingTimeDisplay(remainingTime)
        : NO_TIME_REMAINING,
      stillSomeTimeRemaining: !!remainingTime,
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
