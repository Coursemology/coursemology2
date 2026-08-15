import { FC, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { TIME_LAPSE_NEW_SUBMISSION_MS, workflowStates } from '../constants';
import { remainingTimeDisplay } from '../pages/SubmissionEditIndex/TimeLimitBanner';
import { getAssessment } from '../selectors/assessments';
import { getSubmission } from '../selectors/submissions';
import translations from '../translations';
import { getForceSubmitRemainingTime } from '../utils/timer';

const WarningDialog: FC = () => {
  const { t } = useTranslation();

  const assessment = useAppSelector(getAssessment);
  const submission = useAppSelector(getSubmission);

  const { passwordProtected: isExamMode } = assessment;
  const { workflowState, attemptedAt } = submission;

  const isAttempting = workflowState === workflowStates.Attempting;

  // Milliseconds until force submission — the earlier of time-limit expiry and the effective end
  // date, as computed by the server. The same value the countdown banner uses, so both agree.
  const forceSubmitRemainingTime = getForceSubmitRemainingTime(
    submission,
    assessment,
  );
  const isTimedMode = forceSubmitRemainingTime != null;

  const startTime = new Date(attemptedAt).getTime();
  const currentTime = new Date().getTime();

  const isNewSubmission =
    currentTime - startTime < TIME_LAPSE_NEW_SUBMISSION_MS;

  const [examNotice, setExamNotice] = useState(isExamMode);
  const [timedNotice, setTimedNotice] = useState(isTimedMode);

  const remainingTime =
    forceSubmitRemainingTime && forceSubmitRemainingTime > 0
      ? forceSubmitRemainingTime
      : null;

  let dialogTitle: string = '';
  let dialogMessage: string = '';

  if (examNotice && timedNotice) {
    dialogTitle = t(translations.timedExamDialogTitle, {
      isNewSubmission,
      remainingTime: remainingTimeDisplay(remainingTime ?? 0),
      stillSomeTimeRemaining: !!remainingTime,
    });
    dialogMessage = t(translations.timedExamDialogMessage, {
      stillSomeTimeRemaining: !!remainingTime,
    });
  } else if (examNotice) {
    dialogTitle = t(translations.examDialogTitle);
    dialogMessage = t(translations.examDialogMessage);
  } else if (timedNotice) {
    dialogTitle = t(translations.timedAssessmentDialogTitle, {
      isNewSubmission,
      remainingTime: remainingTimeDisplay(remainingTime ?? 0),
      stillSomeTimeRemaining: !!remainingTime,
    });
    dialogMessage = t(translations.timedAssessmentDialogMessage, {
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
