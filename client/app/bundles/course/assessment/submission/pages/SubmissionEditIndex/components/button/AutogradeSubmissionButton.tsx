import { FC } from 'react';
import { Button } from '@mui/material';

import { autogradeSubmission } from 'course/assessment/submission/actions';
import { workflowStates } from 'course/assessment/submission/constants';
import { getSubmissionFlags } from 'course/assessment/submission/selectors/submissionFlags';
import { getSubmission } from 'course/assessment/submission/selectors/submissions';
import translations from 'course/assessment/submission/translations';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { getSubmissionId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

const AutogradeSubmissionButton: FC = () => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const submission = useAppSelector(getSubmission);
  const submissionFlags = useAppSelector(getSubmissionFlags);

  const submissionId = getSubmissionId();

  const { graderView, workflowState } = submission;
  const { isAutograding, isSaving } = submissionFlags;

  const submitted = workflowState === workflowStates.Submitted;

  const handleAutogradeSubmission = (): void => {
    dispatch(autogradeSubmission(submissionId));
  };

  return (
    graderView &&
    submitted && (
      <Button
        className="mb-2 mr-2"
        color="primary"
        disabled={isSaving || isAutograding}
        endIcon={isAutograding && <LoadingIndicator bare size={20} />}
        onClick={handleAutogradeSubmission}
        variant="contained"
      >
        {t(translations.autograde)}
      </Button>
    )
  );
};

export default AutogradeSubmissionButton;
