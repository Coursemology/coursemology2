import { FC, useState } from 'react';
import { Button } from '@mui/material';

import {
  formNames,
  workflowStates,
} from 'course/assessment/submission/constants';
import { getAssessment } from 'course/assessment/submission/selectors/assessments';
import { getExplanations } from 'course/assessment/submission/selectors/explanations';
import { getQuestions } from 'course/assessment/submission/selectors/questions';
import { getSubmissionFlags } from 'course/assessment/submission/selectors/submissionFlags';
import { getSubmission } from 'course/assessment/submission/selectors/submissions';
import translations from 'course/assessment/submission/translations';
import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

const FinaliseButton: FC = () => {
  const { t } = useTranslation();
  const assessment = useAppSelector(getAssessment);
  const submission = useAppSelector(getSubmission);
  const questions = useAppSelector(getQuestions);
  const explanations = useAppSelector(getExplanations);
  const submissionFlags = useAppSelector(getSubmissionFlags);

  const [finaliseConfirmation, setFinaliseConfirmation] = useState(false);

  const { canUpdate, workflowState } = submission;
  const { autograded, allowPartialSubmission } = assessment;
  const { isSaving } = submissionFlags;

  const attempting = workflowState === workflowStates.Attempting;

  const allConsideredCorrect = (): boolean => {
    if (Object.keys(explanations).length !== Object.keys(questions).length) {
      return false;
    }

    return (
      Object.keys(explanations).filter(
        (questionId) => !explanations[questionId]?.correct,
      ).length === 0
    );
  };

  const shouldRenderForNonAutogradedAssessment = attempting && canUpdate;
  const shouldRenderForAutogradedAssessment =
    attempting && (allowPartialSubmission || allConsideredCorrect());

  const shouldRender = autograded
    ? shouldRenderForAutogradedAssessment
    : shouldRenderForNonAutogradedAssessment;

  return (
    shouldRender && (
      <>
        <Button
          className="mb-2 mr-2"
          color="secondary"
          disabled={isSaving}
          onClick={() => setFinaliseConfirmation(true)}
          variant="contained"
        >
          {t(translations.finalise)}
        </Button>
        <ConfirmationDialog
          form={formNames.SUBMISSION}
          message={t(translations.submitConfirmation)}
          onCancel={() => setFinaliseConfirmation(false)}
          onConfirm={() => setFinaliseConfirmation(false)}
          open={finaliseConfirmation}
        />
      </>
    )
  );
};

export default FinaliseButton;
