import { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@mui/material';
import { AnswerData } from 'types/course/assessment/submission/answer';

import { saveAllAnswers } from 'course/assessment/submission/actions/answers';
import { workflowStates } from 'course/assessment/submission/constants';
import { getSubmissionFlags } from 'course/assessment/submission/selectors/submissionFlags';
import { getSubmission } from 'course/assessment/submission/selectors/submissions';
import translations from 'course/assessment/submission/translations';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

const SaveDraftButton: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const {
    handleSubmit,
    resetField,
    formState: { isDirty },
  } = useFormContext();

  const submission = useAppSelector(getSubmission);
  const submissionFlags = useAppSelector(getSubmissionFlags);

  const { workflowState } = submission;
  const attempting = workflowState === workflowStates.Attempting;

  const { isSaving } = submissionFlags;

  const onSaveDraft = (data: Record<number, AnswerData>): void => {
    dispatch(saveAllAnswers(data, resetField));
  };

  return (
    attempting && (
      <Button
        className="mb-2 mr-2"
        color="primary"
        disabled={!isDirty || isSaving}
        onClick={handleSubmit((data) => onSaveDraft({ ...data }))}
        variant="contained"
      >
        {t(translations.saveDraft)}
      </Button>
    )
  );
};

export default SaveDraftButton;
