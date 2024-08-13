import { FC, useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { AnswerData } from 'types/course/assessment/submission/answer';

import { getSubmissionId } from 'lib/helpers/url-helpers';
import usePrompt from 'lib/hooks/router/usePrompt';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { finalise } from '../../actions';
import { fetchLiveFeedback } from '../../actions/answers';
import WarningDialog from '../../components/WarningDialog';
import {
  formNames,
  POLL_INTERVAL_MILLISECONDS,
  workflowStates,
} from '../../constants';
import GradingPanel from '../../containers/GradingPanel';
import { getInitialAnswer } from '../../selectors/answers';
import { getAssessment } from '../../selectors/assessments';
import { getAttachments } from '../../selectors/attachments';
import { getLiveFeedbacks } from '../../selectors/liveFeedbacks';
import { getQuestions } from '../../selectors/questions';
import { getSubmission } from '../../selectors/submissions';
import translations from '../../translations';
import { setTimerForForceSubmission } from '../../utils/timer';

import AutogradeSubmissionButton from './components/button/AutogradeSubmissionButton';
import FinaliseButton from './components/button/FinaliseButton';
import MarkButton from './components/button/MarkButton';
import PublishButton from './components/button/PublishButton';
import SaveDraftButton from './components/button/SaveDraftButton';
import SaveGradeButton from './components/button/SaveGradeButton';
import UnmarkButton from './components/button/UnmarkButton';
import UnsubmitButton from './components/button/UnsubmitButton';
import ErrorMessages from './components/ErrorMessages';
import SinglePageQuestions from './components/SinglePageQuestions';
import TabbedViewQuestions from './components/TabbedViewQuestions';
import { errorResolver } from './ErrorHelper';

interface Props {
  step: number;
}

const SubmissionForm: FC<Props> = (props) => {
  const { step } = props;

  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const assessment = useAppSelector(getAssessment);
  const submission = useAppSelector(getSubmission);
  const questions = useAppSelector(getQuestions);
  const attachments = useAppSelector(getAttachments);
  const liveFeedbacks = useAppSelector(getLiveFeedbacks);
  const initialValues = useAppSelector(getInitialAnswer);

  const { autograded, timeLimit, tabbedView, questionIds, passwordProtected } =
    assessment;
  const { workflowState, attemptedAt } = submission;

  const maxInitialStep = submission.maxStep ?? questionIds.length - 1;

  const attempting = workflowState === workflowStates.Attempting;

  const submissionId = getSubmissionId();

  const hasSubmissionTimeLimit =
    workflowState === workflowStates.Attempting && timeLimit;
  const submissionTimeLimitAt = hasSubmissionTimeLimit
    ? new Date(attemptedAt).getTime() + timeLimit * 60 * 1000
    : null;

  const initialStep = Math.min(maxInitialStep, Math.max(0, step || 0));

  const [maxStep, setMaxStep] = useState(maxInitialStep);
  const [stepIndex, setStepIndex] = useState(initialStep);

  const methods = useForm({
    defaultValues: initialValues,
    resolver: errorResolver(questions, attachments),
  });

  const onFetchLiveFeedback = (answerId: number, questionId: number): void => {
    const feedbackToken =
      liveFeedbacks?.feedbackByQuestion?.[questionId].pendingFeedbackToken;
    const questionIndex = questionIds.findIndex((id) => id === questionId) + 1;
    const successMessage = t(translations.liveFeedbackSuccess, {
      questionIndex,
    });
    const noFeedbackMessage = t(translations.liveFeedbackNoneGenerated, {
      questionIndex,
    });
    dispatch(
      fetchLiveFeedback({
        answerId,
        questionId,
        feedbackUrl: liveFeedbacks?.feedbackUrl,
        feedbackToken,
        successMessage,
        noFeedbackMessage,
      }),
    );
  };

  const onSubmit = (data: Record<number, AnswerData>): void => {
    dispatch(finalise(submissionId, data));
  };

  const onContinueToNextQuestion = (): void => {
    setMaxStep(Math.max(maxStep, stepIndex + 1));
    setStepIndex(stepIndex + 1);
  };

  const {
    handleSubmit,
    reset,
    formState: { isDirty },
  } = methods;
  usePrompt(isDirty);

  useEffect(() => {
    reset(initialValues);
  }, [initialValues]);

  useEffect(() => {
    if (submissionTimeLimitAt) {
      setTimerForForceSubmission(
        submissionTimeLimitAt,
        handleSubmit((data) => onSubmit({ ...data })),
      );
    }
  }, [submissionTimeLimitAt]);

  const scrollToRef = useRef(null);

  useEffect(() => {
    if (step !== null && !tabbedView) {
      const assignedStep = Math.min(questionIds.length - 1, Math.max(step, 0));
      setStepIndex(assignedStep);

      if (scrollToRef.current) {
        setImmediate(() =>
          (scrollToRef.current! as HTMLElement).scrollIntoView(),
        );
      }
    }
  });

  const pollerRef = useRef<NodeJS.Timeout | null>(null);
  const pollAllFeedback = (): void => {
    questionIds.forEach((id) => {
      const question = questions[id];
      const feedbackRequestToken =
        liveFeedbacks?.feedbackByQuestion?.[question.id]?.pendingFeedbackToken;
      if (feedbackRequestToken) {
        onFetchLiveFeedback(question.answerId!, id);
      }
    });
  };

  useEffect(() => {
    // check for feedback from Codaveri on page load for each question
    pollerRef.current = setInterval(
      pollAllFeedback,
      POLL_INTERVAL_MILLISECONDS,
    );

    // clean up poller on unmount
    return () => {
      if (pollerRef.current) {
        clearInterval(pollerRef.current);
      }
    };
  });

  return (
    <div className="mt-4">
      <FormProvider {...methods}>
        <form
          encType="multipart/form-data"
          id={formNames.SUBMISSION}
          noValidate
          onSubmit={handleSubmit((data) => onSubmit({ ...data }))}
        >
          {autograded || tabbedView ? (
            <TabbedViewQuestions
              handleNext={onContinueToNextQuestion}
              maxStep={maxStep}
              setStepIndex={setStepIndex}
              stepIndex={stepIndex}
            />
          ) : (
            <SinglePageQuestions
              scrollToRef={scrollToRef}
              stepIndex={stepIndex}
            />
          )}
          <GradingPanel />

          <SaveDraftButton />
          <SaveGradeButton />
          {!autograded && <AutogradeSubmissionButton />}

          <div style={{ display: 'inline', float: 'right' }}>
            <FinaliseButton />
          </div>

          <UnsubmitButton />
          {!autograded && (
            <>
              <MarkButton />
              <UnmarkButton />
              <PublishButton />
            </>
          )}
          <ErrorMessages />
        </form>
      </FormProvider>

      <WarningDialog
        isAttempting={attempting}
        isExamMode={passwordProtected}
        isTimedMode={!!submissionTimeLimitAt}
        submissionTimeLimitAt={submissionTimeLimitAt}
      />
    </div>
  );
};

export default SubmissionForm;
