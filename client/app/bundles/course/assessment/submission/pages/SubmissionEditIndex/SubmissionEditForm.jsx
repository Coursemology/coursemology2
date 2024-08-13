import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import usePrompt from 'lib/hooks/router/usePrompt';

import WarningDialog from '../../components/WarningDialog';
import { formNames, POLL_INTERVAL_MILLISECONDS } from '../../constants';
import GradingPanel from '../../containers/GradingPanel';
import {
  attachmentShape,
  explanationShape,
  historyQuestionShape,
  questionFlagsShape,
  questionGradeShape,
  questionShape,
  topicShape,
} from '../../propTypes';
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

const SubmissionEditForm = (props) => {
  const {
    attachments,
    attempting,
    liveFeedback,
    submissionTimeLimitAt,
    onSubmit,
    onFetchLiveFeedback,
    initialValues,
    passwordProtected,
    questionIds,
    questions,
    tabbedView,
    maxStep: maxInitialStep,
    step,
  } = props;

  let initialStep = Math.min(maxInitialStep, Math.max(0, step || 0));

  const [stepIndex, setStepIndex] = useState(initialStep);

  const methods = useForm({
    defaultValues: initialValues,
    resolver: errorResolver(questions, attachments),
  });

  const {
    handleSubmit,
    reset,
    formState: { isDirty },
  } = methods;
  usePrompt(isDirty);

  useEffect(() => {
    reset(initialValues);
  }, [initialValues]);

  const scrollToRef = useRef(null);

  useEffect(() => {
    initialStep = props.step;

    if (initialStep !== null && !tabbedView) {
      initialStep = initialStep < 0 ? 0 : initialStep;
      initialStep =
        initialStep >= questionIds.length - 1
          ? questionIds.length - 1
          : initialStep;
      if (scrollToRef.current) {
        setImmediate(() => scrollToRef.current.scrollIntoView());
      }
      setStepIndex(initialStep);
    }
  }, []);

  useEffect(() => {
    if (submissionTimeLimitAt) {
      setTimerForForceSubmission(
        submissionTimeLimitAt,
        handleSubmit((data) => onSubmit({ ...data })),
      );
    }
  }, [submissionTimeLimitAt]);

  const pollerRef = useRef(null);
  const pollAllFeedback = () => {
    questionIds.forEach((id) => {
      const question = questions[id];
      const feedbackRequestToken =
        liveFeedback?.feedbackByQuestion?.[question.id]?.pendingFeedbackToken;
      if (feedbackRequestToken) {
        onFetchLiveFeedback(question.answerId, question.id);
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
      clearInterval(pollerRef.current);
    };
  });

  return (
    <>
      <FormProvider {...methods}>
        <form
          encType="multipart/form-data"
          id={formNames.SUBMISSION}
          noValidate
          onSubmit={handleSubmit((data) => onSubmit({ ...data }))}
        >
          {tabbedView ? (
            <TabbedViewQuestions
              handleNext={() => {}}
              maxStep={questionIds.length - 1}
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
          <AutogradeSubmissionButton />

          <div style={{ display: 'inline', float: 'right' }}>
            <FinaliseButton />
          </div>

          <UnsubmitButton />
          <MarkButton />
          <UnmarkButton />
          <PublishButton />
          <ErrorMessages />
        </form>
      </FormProvider>

      <WarningDialog
        isAttempting={attempting}
        isExamMode={passwordProtected}
        isTimedMode={!!submissionTimeLimitAt}
        submissionTimeLimitAt={submissionTimeLimitAt}
      />
    </>
  );
};

SubmissionEditForm.propTypes = {
  initialValues: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,

  assessment: PropTypes.object,
  attachments: PropTypes.arrayOf(attachmentShape),
  graderView: PropTypes.bool.isRequired,
  canUpdate: PropTypes.bool.isRequired,
  submissionTimeLimitAt: PropTypes.number,
  delayedGradePublication: PropTypes.bool.isRequired,
  passwordProtected: PropTypes.bool.isRequired,
  tabbedView: PropTypes.bool.isRequired,
  maxStep: PropTypes.number.isRequired,
  step: PropTypes.number,
  showMcqMrqSolution: PropTypes.bool.isRequired,
  isCodaveriEnabled: PropTypes.bool.isRequired,

  attempting: PropTypes.bool.isRequired,
  submitted: PropTypes.bool.isRequired,
  graded: PropTypes.bool.isRequired,
  published: PropTypes.bool.isRequired,

  codaveriFeedbackStatus: PropTypes.object,
  explanations: PropTypes.objectOf(explanationShape),
  liveFeedback: PropTypes.object,
  grading: PropTypes.objectOf(questionGradeShape),
  questionIds: PropTypes.arrayOf(PropTypes.number),
  questions: PropTypes.objectOf(questionShape),
  historyQuestions: PropTypes.objectOf(historyQuestionShape),
  questionsFlags: PropTypes.objectOf(questionFlagsShape),
  topics: PropTypes.objectOf(topicShape),
  isAutograding: PropTypes.bool.isRequired,
  isSaving: PropTypes.bool.isRequired,

  handleAutogradeSubmission: PropTypes.func,
  onReset: PropTypes.func,
  onSaveDraft: PropTypes.func,
  onSubmit: PropTypes.func,
  onSubmitAnswer: PropTypes.func,
  onReevaluateAnswer: PropTypes.func,
  onFetchLiveFeedback: PropTypes.func,
  onGenerateLiveFeedback: PropTypes.func,
  onGenerateFeedback: PropTypes.func,
  handleUnsubmit: PropTypes.func,
  handleSaveAllGrades: PropTypes.func,
  handleSaveGrade: PropTypes.func,
  handleMark: PropTypes.func,
  handleUnmark: PropTypes.func,
  handlePublish: PropTypes.func,
};

function mapStateToProps(state) {
  return {
    assessment: state.assessments.submission.assessment,
    attachments: state.assessments.submission.attachments,
    liveFeedback: state.assessments.submission.liveFeedback,
  };
}

export default connect(mapStateToProps)(injectIntl(SubmissionEditForm));
