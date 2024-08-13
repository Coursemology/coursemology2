import { FC } from 'react';
import { Button } from '@mui/material';

import { getAssessment } from 'course/assessment/submission/selectors/assessments';
import { getExplanations } from 'course/assessment/submission/selectors/explanations';
import { getSubmissionFlags } from 'course/assessment/submission/selectors/submissionFlags';
import translations from 'course/assessment/submission/translations';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  stepIndex: number;
  onContinue: () => void;
}

const ContinueButton: FC<Props> = (props) => {
  const { stepIndex, onContinue } = props;

  const { t } = useTranslation();
  const assessment = useAppSelector(getAssessment);
  const explanations = useAppSelector(getExplanations);
  const submissionFlags = useAppSelector(getSubmissionFlags);

  const { autograded, questionIds, showMcqAnswer } = assessment;

  const questionId = questionIds[stepIndex];
  const { isSaving } = submissionFlags;

  const isExplanationCorrect =
    explanations[questionId] && explanations[questionId].correct;

  const isLastQuestion = stepIndex === questionIds.length - 1;

  let disabled = true;
  if (isSaving) {
    disabled = true;
  } else if (isExplanationCorrect) {
    disabled = false;
  } else {
    disabled = showMcqAnswer;
  }

  return (
    autograded &&
    !isLastQuestion && (
      <Button
        className={`mb-2 mr-2 ${!disabled && 'bg-green-600 text-white'}`}
        disabled={disabled}
        onClick={() => onContinue()}
        variant="contained"
      >
        {t(translations.continue)}
      </Button>
    )
  );
};

export default ContinueButton;
