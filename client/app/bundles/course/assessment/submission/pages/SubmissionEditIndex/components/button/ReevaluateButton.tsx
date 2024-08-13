import { FC } from 'react';
import { Button } from '@mui/material';

import {
  generateFeedback,
  reevaluateAnswer,
} from 'course/assessment/submission/actions/answers';
import { questionTypes } from 'course/assessment/submission/constants';
import { getAssessment } from 'course/assessment/submission/selectors/assessments';
import { getCodaveriFeedbackStatus } from 'course/assessment/submission/selectors/codaveriFeedbackStatus';
import { getQuestionFlags } from 'course/assessment/submission/selectors/questionFlags';
import { getQuestions } from 'course/assessment/submission/selectors/questions';
import { getSubmissionFlags } from 'course/assessment/submission/selectors/submissionFlags';
import translations from 'course/assessment/submission/translations';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { getSubmissionId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  questionId: number;
}

const ReevaluateButton: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { questionId } = props;

  const assessment = useAppSelector(getAssessment);
  const questions = useAppSelector(getQuestions);
  const questionFlags = useAppSelector(getQuestionFlags);
  const submissionFlags = useAppSelector(getSubmissionFlags);
  const codaveriFeedbackStatus = useAppSelector(getCodaveriFeedbackStatus);

  const submissionId = getSubmissionId();

  const dispatch = useAppDispatch();

  const { isCodaveriEnabled } = assessment;

  const question = questions[questionId];
  const { answerId } = question;

  const { isAutograding } = questionFlags[questionId] || {};

  const { isSaving } = submissionFlags;

  const shouldRender =
    question.type === questionTypes.Programming &&
    isCodaveriEnabled &&
    question.isCodaveri;

  const onGenerateFeedback = (): void => {
    dispatch(generateFeedback(submissionId, answerId, questionId));
  };

  const onReevaluateAnswer = (): void => {
    dispatch(reevaluateAnswer(submissionId, answerId, questionId));
  };

  return (
    <>
      {shouldRender && (
        <Button
          className="mb-2 mr-2"
          color="secondary"
          disabled={
            (answerId &&
              codaveriFeedbackStatus?.answers[answerId]?.jobStatus ===
                'submitted') ||
            isSaving
          }
          id="retrieve-code-feedback"
          onClick={() => onGenerateFeedback()}
          variant="contained"
        >
          {t(translations.generateCodaveriFeedback)}
        </Button>
      )}
      <Button
        className="mb-2 mr-2"
        color="secondary"
        disabled={isAutograding || isSaving}
        endIcon={isAutograding && <LoadingIndicator bare size={20} />}
        id="re-evaluate-code"
        onClick={() => onReevaluateAnswer()}
        variant="contained"
      >
        {t(translations.reevaluate)}
      </Button>
    </>
  );
};

export default ReevaluateButton;
