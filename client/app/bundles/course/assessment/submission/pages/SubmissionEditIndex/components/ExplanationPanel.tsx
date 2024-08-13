import { FC } from 'react';
import { Card, CardContent, CardHeader, Typography } from '@mui/material';

import {
  questionTypes,
  workflowStates,
} from 'course/assessment/submission/constants';
import { getAssessment } from 'course/assessment/submission/selectors/assessments';
import { getExplanations } from 'course/assessment/submission/selectors/explanations';
import { getQuestions } from 'course/assessment/submission/selectors/questions';
import { getSubmission } from 'course/assessment/submission/selectors/submissions';
import translations from 'course/assessment/submission/translations';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  questionId: number;
}

const ExplanationPanel: FC<Props> = (props) => {
  const { questionId } = props;

  const { t } = useTranslation();

  const assessment = useAppSelector(getAssessment);
  const questions = useAppSelector(getQuestions);
  const explanations = useAppSelector(getExplanations);
  const submission = useAppSelector(getSubmission);

  const { workflowState } = submission;
  const attempting = workflowState === workflowStates.Attempting;

  const question = questions[questionId];
  const explanation = explanations[questionId];

  if (!explanation) {
    return null;
  }

  const shouldRenderForNonAutograded =
    explanation.correct === false && attempting;
  const shouldRenderForAutograded =
    explanation.correct !== null &&
    (explanation.correct === false ||
      question.type !== questionTypes.Programming);

  const shouldRender = assessment.autograded
    ? shouldRenderForAutograded
    : shouldRenderForNonAutograded;

  if (!shouldRender) {
    return null;
  }

  const getExplanationTitle = (): string => {
    if (explanation.correct && question.autogradable) {
      return t(translations.correct);
    }

    if (explanation.correct && !question.autogradable) {
      return t(translations.answerSubmitted);
    }

    if (explanation.failureType === 'public_test') {
      return t(translations.publicTestCaseFailure);
    }

    if (explanation.failureType === 'private_test') {
      return t(translations.privateTestCaseFailure);
    }

    return t(translations.wrong);
  };

  return (
    <Card className="mt-8 mb-8 rounded">
      <CardHeader
        className={`p-3 rounded-t ${explanation.correct ? 'bg-green-200 text-green-900' : 'bg-red-200 text-red-900'}`}
        title={getExplanationTitle()}
        titleTypographyProps={{ variant: 'body2' }}
      />
      {explanation.explanations.every(
        (exp) => exp.trim().length === 0,
      ) ? null : (
        <CardContent>
          {explanation.explanations.map((exp, idx) => (
            <Typography
              // eslint-disable-next-line react/no-array-index-key
              key={idx}
              dangerouslySetInnerHTML={{ __html: exp }}
              variant="body2"
            />
          ))}
        </CardContent>
      )}
    </Card>
  );
};

export default ExplanationPanel;
