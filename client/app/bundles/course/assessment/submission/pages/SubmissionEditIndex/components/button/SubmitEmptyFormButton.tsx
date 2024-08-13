import { FC } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Typography } from '@mui/material';

import {
  formNames,
  workflowStates,
} from 'course/assessment/submission/constants';
import { getSubmissionFlags } from 'course/assessment/submission/selectors/submissionFlags';
import { getSubmission } from 'course/assessment/submission/selectors/submissions';
import translations from 'course/assessment/submission/translations';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

const SubmitEmptyFormButton: FC = () => {
  const { t } = useTranslation();

  const submission = useAppSelector(getSubmission);
  const submissionFlags = useAppSelector(getSubmissionFlags);

  const { canUpdate, workflowState } = submission;
  const { isSaving } = submissionFlags;

  const attempting = workflowState === workflowStates.Attempting;

  return (
    attempting &&
    canUpdate && (
      <div className="w-auto relative flex flex-col items-center">
        <Typography variant="body2">
          <FormattedMessage {...translations.submitNoQuestionExplain} />
        </Typography>
        <Button
          className="mb-2 mr-2"
          color="primary"
          disabled={isSaving}
          form={formNames.SUBMISSION}
          type="submit"
          variant="contained"
        >
          {t(translations.ok)}
        </Button>
      </div>
    )
  );
};

export default SubmitEmptyFormButton;
