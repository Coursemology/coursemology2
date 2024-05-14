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

import translations from '../translations';

interface Props {
  isExamMode: boolean;
  isTimedMode: boolean;
  isAttempting: boolean;
  timeLimit?: number;
}

const WarningDialog: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { isExamMode, isTimedMode, isAttempting, timeLimit } = props;

  const [examNotice, setExamNotice] = useState(isExamMode);
  const [timedNotice, setTimedNotice] = useState(isTimedMode);

  let dialogTitle: string = '';
  let dialogMessage: string = '';

  if (examNotice && timedNotice) {
    dialogTitle = t(translations.timedExamDialogTitle);
    dialogMessage = t(translations.timedExamDialogMessage, {
      timeLimit: timeLimit ?? 0,
    });
  } else if (examNotice) {
    dialogTitle = t(translations.examDialogTitle);
    dialogMessage = t(translations.examDialogMessage);
  } else if (timedNotice) {
    dialogTitle = t(translations.timedAssessmentDialogTitle);
    dialogMessage = t(translations.timedAssessmentDialogMessage, {
      timeLimit: timeLimit ?? 0,
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
