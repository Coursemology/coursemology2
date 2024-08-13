import { FC } from 'react';
import { Button } from '@mui/material';

import { unmark } from 'course/assessment/submission/actions';
import { workflowStates } from 'course/assessment/submission/constants';
import { getSubmissionFlags } from 'course/assessment/submission/selectors/submissionFlags';
import { getSubmission } from 'course/assessment/submission/selectors/submissions';
import translations from 'course/assessment/submission/translations';
import { getSubmissionId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

const UnmarkButton: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const submission = useAppSelector(getSubmission);
  const submissionFlags = useAppSelector(getSubmissionFlags);

  const { graderView, workflowState } = submission;
  const { isSaving } = submissionFlags;

  const submissionId = getSubmissionId();

  const graded = workflowState === workflowStates.Graded;
  const disabled = isSaving;

  const handleUnmark = (): void => {
    dispatch(unmark(submissionId));
  };

  return (
    graderView &&
    graded && (
      <Button
        className={`mb-2 mr-2 ${disabled ? 'bg-gray-400 text-gray-600' : 'bg-yellow-600 text-white'}`}
        disabled={disabled}
        onClick={handleUnmark}
        variant="contained"
      >
        {t(translations.unmark)}
      </Button>
    )
  );
};

export default UnmarkButton;
