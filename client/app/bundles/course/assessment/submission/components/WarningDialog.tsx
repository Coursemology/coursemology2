import { FC, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { setTimerStartAt } from '../actions';
import { workflowStates } from '../constants';
import RemainingTimeTranslations from '../pages/SubmissionEditIndex/components/RemainingTimeTranslations';
import { getAssessment } from '../selectors/assessments';
import { getSubmission } from '../selectors/submissions';
import translations from '../translations';

const WarningDialog: FC = () => {
  const { t } = useTranslation();

  const assessment = useAppSelector(getAssessment);
  const submission = useAppSelector(getSubmission);

  const dispatch = useAppDispatch();

  const { timeLimit, passwordProtected: isExamMode } = assessment;
  const { workflowState, timerStartedAt } = submission;

  const isAttempting = workflowState === workflowStates.Attempting;
  const isTimedMode = isAttempting && !!timeLimit;

  const isNewSubmission = isTimedMode && !timerStartedAt;

  const currentTime = new Date().getTime();

  const submissionTimeLimitAt =
    isTimedMode && timerStartedAt
      ? new Date(timerStartedAt).getTime() + timeLimit * 60 * 1000
      : null;

  const [examNotice, setExamNotice] = useState(isExamMode);
  const [timedNotice, setTimedNotice] = useState(isTimedMode);

  const { submissionId } = useParams();
  if (!submissionId) {
    return null;
  }

  const remainingTime =
    isTimedMode && timerStartedAt && submissionTimeLimitAt! > currentTime
      ? submissionTimeLimitAt! - currentTime
      : null;

  let dialogTitle: string = '';
  let dialogMessage: string = '';

  if (examNotice && timedNotice) {
    dialogTitle = t(translations.timedExamDialogTitle, {
      isNewSubmission,
      remainingTime: (
        <RemainingTimeTranslations
          remainingTime={
            isNewSubmission ? timeLimit! * 60 * 1000 : remainingTime ?? 0
          }
        />
      ),

      stillSomeTimeRemaining: isNewSubmission || !!remainingTime,
    });
    dialogMessage = isNewSubmission
      ? t(translations.timedExamStartDialogMessage)
      : t(translations.timedExamDialogMessage, {
          stillSomeTimeRemaining: !!remainingTime,
        });
  } else if (examNotice) {
    dialogTitle = t(translations.examDialogTitle);
    dialogMessage = t(translations.examDialogMessage);
  } else if (timedNotice) {
    dialogTitle = t(translations.timedAssessmentDialogTitle, {
      isNewSubmission,
      remainingTime: (
        <RemainingTimeTranslations
          remainingTime={
            isNewSubmission ? timeLimit! * 60 * 1000 : remainingTime ?? 0
          }
        />
      ),
      stillSomeTimeRemaining: isNewSubmission || !!remainingTime,
    });
    dialogMessage = isNewSubmission
      ? t(translations.timedAssessmentStartDialogMessage)
      : t(translations.timedAssessmentDialogMessage, {
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
            if (isNewSubmission) {
              dispatch(
                setTimerStartAt(submissionId, setExamNotice, setTimedNotice),
              );
            } else {
              setExamNotice(false);
              setTimedNotice(false);
            }
          }}
        >
          {t(translations.start, { isNewSubmission })}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WarningDialog;
