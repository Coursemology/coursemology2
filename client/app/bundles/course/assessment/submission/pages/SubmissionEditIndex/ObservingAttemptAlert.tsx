import { FC } from 'react';
import { Alert } from '@mui/material';

import { workflowStates } from 'course/assessment/submission/constants';
import { getSubmission } from 'course/assessment/submission/selectors/submissions';
import translations from 'course/assessment/submission/translations';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

/**
 * Warns a viewer who is not the submission's creator that the attempt is still in progress, and that
 * anything they change here writes straight into the student's own answers.
 *
 * Staff editing a third party's answers is not currently locked down (managers and owners hold
 * `:update`/`:submit_answer` on every answer in their course), so this is a deterrent rather than a
 * guard: it makes the consequence visible at the point of editing.
 */
const ObservingAttemptAlert: FC = () => {
  const { t } = useTranslation();
  const submission = useAppSelector(getSubmission);

  const attempting = submission.workflowState === workflowStates.Attempting;
  if (!attempting || submission.isCreator) return null;

  return (
    <Alert severity="warning">{t(translations.observingAttemptWarning)}</Alert>
  );
};

export default ObservingAttemptAlert;
