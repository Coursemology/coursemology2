import { FC } from 'react';
import { Button } from '@mui/material';

import { publish } from 'course/assessment/submission/actions';
import { workflowStates } from 'course/assessment/submission/constants';
import { getAssessment } from 'course/assessment/submission/selectors/assessments';
import {
  getExperiencePoints,
  getQuestionWithGrades,
} from 'course/assessment/submission/selectors/grading';
import { getSubmissionFlags } from 'course/assessment/submission/selectors/submissionFlags';
import { getSubmission } from 'course/assessment/submission/selectors/submissions';
import translations from 'course/assessment/submission/translations';
import { getSubmissionId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

const PublishButton: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const assessment = useAppSelector(getAssessment);
  const submission = useAppSelector(getSubmission);
  const questionWithGrades = useAppSelector(getQuestionWithGrades);
  const submissionFlags = useAppSelector(getSubmissionFlags);
  const expPoints = useAppSelector(getExperiencePoints);

  const { delayedGradePublication } = assessment;
  const { graderView, workflowState } = submission;
  const { isSaving } = submissionFlags;

  const submissionId = getSubmissionId();

  const submitted = workflowState === workflowStates.Submitted;

  const anyUngraded = Object.values(questionWithGrades).some(
    (q) => q.grade === undefined || q.grade === null,
  );

  const handlePublish = (): void => {
    dispatch(
      publish(submissionId, Object.values(questionWithGrades), expPoints),
    );
  };

  return (
    !delayedGradePublication &&
    graderView &&
    submitted && (
      <Button
        className="mb-2 mr-2"
        color="secondary"
        disabled={isSaving || anyUngraded}
        onClick={handlePublish}
        variant="contained"
      >
        {t(translations.publish)}
      </Button>
    )
  );
};

export default PublishButton;
