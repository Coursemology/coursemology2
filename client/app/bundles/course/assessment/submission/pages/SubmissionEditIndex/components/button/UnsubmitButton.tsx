import { FC, useState } from 'react';
import { Button } from '@mui/material';

import { unsubmit } from 'course/assessment/submission/actions';
import { workflowStates } from 'course/assessment/submission/constants';
import { getSubmissionFlags } from 'course/assessment/submission/selectors/submissionFlags';
import { getSubmission } from 'course/assessment/submission/selectors/submissions';
import translations from 'course/assessment/submission/translations';
import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import { getSubmissionId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

const UnsubmitButton: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const submission = useAppSelector(getSubmission);
  const submissionFlags = useAppSelector(getSubmissionFlags);

  const { graderView, workflowState } = submission;
  const { isSaving } = submissionFlags;

  const submissionId = getSubmissionId();

  const [unsubmitConfirmation, setUnsubmitConfirmation] = useState(false);

  const submitted = workflowState === workflowStates.Submitted;
  const published = workflowState === workflowStates.Published;

  const onUnsubmit = (): void => {
    dispatch(unsubmit(submissionId));
  };

  return (
    graderView &&
    (submitted || published) && (
      <>
        <Button
          className="mb-2 mr-2"
          color="secondary"
          disabled={isSaving}
          onClick={() => setUnsubmitConfirmation(true)}
          variant="contained"
        >
          {t(translations.unsubmit)}
        </Button>
        <ConfirmationDialog
          message={t(translations.unsubmitConfirmation)}
          onCancel={() => setUnsubmitConfirmation(false)}
          onConfirm={() => {
            setUnsubmitConfirmation(false);
            onUnsubmit();
          }}
          open={unsubmitConfirmation}
        />
      </>
    )
  );
};

export default UnsubmitButton;
