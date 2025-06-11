import { FC, useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { AnswerData } from 'types/course/assessment/submission/answer';

import { getSubmissionId } from 'lib/helpers/url-helpers';
import usePrompt from 'lib/hooks/router/usePrompt';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { finalise, getEvaluationResult, getJobStatus } from '../../actions';
import { fetchLiveFeedback } from '../../actions/answers';
import AllAttemptsPrompt from '../../components/AllAttempts';
import WarningDialog from '../../components/WarningDialog';
import actionTypes, {
  EVALUATE_POLL_INTERVAL_MILLISECONDS,
  FEEDBACK_POLL_INTERVAL_MILLISECONDS,
  formNames,
  workflowStates,
} from '../../constants';
import GradingPanel from '../../containers/GradingPanel';
import { getInitialAnswer } from '../../selectors/answers';
import { getAssessment } from '../../selectors/assessments';
import { getAttachments } from '../../selectors/attachments';
import { getQuestionFlags } from '../../selectors/questionFlags';
import { getQuestions } from '../../selectors/questions';
import { getSubmission } from '../../selectors/submissions';
import translations from '../../translations';
import { HistoryViewData } from '../../types';
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
  const questionFlags = useAppSelector(getQuestionFlags);
  const attachments = useAppSelector(getAttachments);
  const liveFeedbackChats = useAppSelector(
    (state) => state.assessments.submission.liveFeedbackChats,
  );
  const initialValues = useAppSelector(getInitialAnswer);

  const { autograded, timeLimit, tabbedView, questionIds } = assessment;
  const { workflowState, attemptedAt } = submission;

  const answerIds = Object.values(questions).map(
    (question) => question.answerId,
  );

  const maxInitialStep = submission.maxStep ?? questionIds.length - 1;

  const submissionId = getSubmissionId();

  const hasSubmissionTimeLimit =
    workflowState === workflowStates.Attempting && timeLimit;
  const submissionTimeLimitAt = hasSubmissionTimeLimit
    ? new Date(attemptedAt).getTime() + timeLimit * 60 * 1000
    : null;

  const initialStep = Math.min(maxInitialStep, Math.max(0, step || 0));

  const [maxStep, setMaxStep] = useState(maxInitialStep);
  const [stepIndex, setStepIndex] = useState(initialStep);
  const [historyInfo, setHistoryInfo] = useState<HistoryViewData>({
    open: false,
    questionId: 0,
    questionNumber: 0,
  });

  const methods = useForm({
    defaultValues: initialValues,
    resolver: errorResolver(questions, attachments),
  });

  const onFetchLiveFeedback = (answerId: number): void => {
    const liveFeedbackChatsForAnswer =
      liveFeedbackChats.liveFeedbackChatPerAnswer.entities[answerId];
    if (!liveFeedbackChatsForAnswer) return;

    const currentThreadId = liveFeedbackChatsForAnswer.currentThreadId;
    const feedbackToken = liveFeedbackChatsForAnswer.pendingFeedbackToken;
    const feedbackUrl = liveFeedbackChats.liveFeedbackChatUrl;
    const noFeedbackMessage = t(translations.liveFeedbackNoneGenerated);
    const errorMessage = t(translations.requestFailure);
    dispatch(
      fetchLiveFeedback({
        answerId,
        feedbackUrl,
        feedbackToken,
        currentThreadId,
        noFeedbackMessage,
        errorMessage,
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
        setTimeout(
          () => (scrollToRef.current! as HTMLElement).scrollIntoView(),
          0,
        );
      }
    }
  });

  const feedbackPollerRef = useRef<NodeJS.Timeout | null>(null);
  const evaluatePollerRef = useRef<NodeJS.Timeout | null>(null);
  const pollAllFeedback = (): void => {
    answerIds.forEach((answerId) => {
      if (!answerId) return;
      const feedbackRequestToken =
        liveFeedbackChats.liveFeedbackChatPerAnswer.entities[answerId];
      if (feedbackRequestToken?.pendingFeedbackToken) {
        onFetchLiveFeedback(answerId);
      }
    });
  };

  const handleEvaluationPolling = (): void => {
    Object.values(questions).forEach((question) => {
      if (
        questionFlags[question.id]?.isAutograding &&
        questionFlags[question.id]?.jobUrl
      ) {
        getJobStatus(questionFlags[question.id].jobUrl).then((response) => {
          switch (response.data.status) {
            case 'submitted':
              break;
            case 'completed':
              dispatch(
                getEvaluationResult(
                  submissionId,
                  question.answerId,
                  question.id,
                ),
              );
              break;
            case 'errored':
              dispatch({
                type: actionTypes.AUTOGRADE_FAILURE,
                answerId: question.answerId,
                questionId: question.id,
              });
              break;
            default:
              throw new Error('Unknown job status');
          }
        });
      }
    });
  };

  useEffect(() => {
    // check for feedback from Codaveri on page load for each question
    feedbackPollerRef.current = setInterval(
      pollAllFeedback,
      FEEDBACK_POLL_INTERVAL_MILLISECONDS,
    );

    evaluatePollerRef.current = setInterval(
      handleEvaluationPolling,
      EVALUATE_POLL_INTERVAL_MILLISECONDS,
    );

    // clean up poller on unmount
    return () => {
      if (feedbackPollerRef.current) {
        clearInterval(feedbackPollerRef.current);
      }
      if (evaluatePollerRef.current) {
        clearInterval(evaluatePollerRef.current);
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
          {tabbedView ? (
            <TabbedViewQuestions
              handleNext={onContinueToNextQuestion}
              maxStep={maxStep}
              setHistoryInfo={setHistoryInfo}
              setStepIndex={setStepIndex}
              stepIndex={stepIndex}
            />
          ) : (
            <SinglePageQuestions
              scrollToRef={scrollToRef}
              setHistoryInfo={setHistoryInfo}
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

      <AllAttemptsPrompt
        graderView={submission.graderView}
        onClose={(): void => setHistoryInfo({ ...historyInfo, open: false })}
        open={historyInfo.open}
        questionId={historyInfo.questionId}
        submissionId={submission.id}
        title={
          <>
            {t(translations.historyTitle, {
              number: historyInfo.questionNumber,
              studentName: submission.submitter.name,
            })}
          </>
        }
      />
      <WarningDialog />
    </div>
  );
};

export default SubmissionForm;
