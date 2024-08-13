import { FC } from 'react';
import { Button } from '@mui/material';

import {
  generateLiveFeedback,
  initializeLiveFeedback,
} from 'course/assessment/submission/actions/answers';
import { getAssessment } from 'course/assessment/submission/selectors/assessments';
import { getLiveFeedbacks } from 'course/assessment/submission/selectors/liveFeedbacks';
import { getQuestionFlags } from 'course/assessment/submission/selectors/questionFlags';
import { getQuestions } from 'course/assessment/submission/selectors/questions';
import { getSubmission } from 'course/assessment/submission/selectors/submissions';
import translations from 'course/assessment/submission/translations';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { getSubmissionId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  questionId: number;
}

const LiveFeedbackButton: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { questionId } = props;

  const dispatch = useAppDispatch();

  const assessment = useAppSelector(getAssessment);
  const submission = useAppSelector(getSubmission);
  const questions = useAppSelector(getQuestions);
  const questionFlags = useAppSelector(getQuestionFlags);
  const liveFeedback = useAppSelector(getLiveFeedbacks);

  const submissionId = getSubmissionId();

  const question = questions[questionId];

  const { questionIds } = assessment;
  const { graderView } = submission;
  const { answerId, attemptsLeft } = question;
  const { isResetting } = questionFlags[questionId] || {};

  const isRequestingLiveFeedback =
    liveFeedback?.feedbackByQuestion?.[questionId]?.isRequestingLiveFeedback ??
    false;

  const isPollingLiveFeedback =
    (liveFeedback?.feedbackByQuestion?.[questionId]?.pendingFeedbackToken ??
      false) !== false;

  const onGenerateLiveFeedback = (): void => {
    const questionIndex = questionIds.findIndex((id) => id === questionId) + 1;
    const successMessage = t(translations.liveFeedbackSuccess, {
      questionIndex,
    });
    const noFeedbackMessage = t(translations.liveFeedbackNoneGenerated, {
      questionIndex,
    });

    dispatch(initializeLiveFeedback(questionId));
    dispatch(
      generateLiveFeedback({
        submissionId,
        answerId,
        questionId,
        successMessage,
        noFeedbackMessage,
      }),
    );
  };

  // TODO: update logic pending #7418: allow [Get Help] on all programming questions

  return (
    <Button
      className="mb-2 mr-2"
      color="info"
      disabled={
        isResetting ||
        isRequestingLiveFeedback ||
        isPollingLiveFeedback ||
        (!graderView && attemptsLeft === 0)
      }
      id="get-live-feedback"
      onClick={() => onGenerateLiveFeedback()}
      startIcon={
        (isRequestingLiveFeedback || isPollingLiveFeedback) && (
          <LoadingIndicator bare size={20} />
        )
      }
      variant="contained"
    >
      {t(translations.generateCodaveriLiveFeedback)}
    </Button>
  );
};

export default LiveFeedbackButton;
