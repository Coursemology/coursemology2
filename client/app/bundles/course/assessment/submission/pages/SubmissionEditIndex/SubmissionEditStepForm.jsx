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
  questionShape,
  topicShape,
} from '../../propTypes';
import { setTimerForForceSubmission } from '../../utils/timer';

import FinaliseButton from './components/button/FinaliseButton';
import SaveDraftButton from './components/button/SaveDraftButton';
import SaveGradeButton from './components/button/SaveGradeButton';
import UnsubmitButton from './components/button/UnsubmitButton';
import ErrorMessages from './components/ErrorMessages';
import TabbedViewQuestions from './components/TabbedViewQuestions';
import { errorResolver } from './ErrorHelper';

const SubmissionEditStepForm = (props) => {
  const {
    attachments,
    attempting,
    submissionTimeLimitAt,
    liveFeedback,
    onSubmit,
    onFetchLiveFeedback,
    initialValues,
    maxStep: maxInitialStep,
    questionIds,
    questions,
    step,
  } = props;

  const initialStep = Math.min(maxInitialStep, Math.max(0, step || 0));

  const [maxStep, setMaxStep] = useState(maxInitialStep);
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

  const handleNext = () => {
    setMaxStep(Math.max(maxStep, stepIndex + 1));
    setStepIndex(stepIndex + 1);
  };

  return (
    <div className="mt-4">
      <FormProvider {...methods}>
        <form
          encType="multipart/form-data"
          id={formNames.SUBMISSION}
          noValidate
          onSubmit={handleSubmit((data) => onSubmit({ ...data }))}
        >
          <TabbedViewQuestions
            handleNext={handleNext}
            maxStep={maxStep}
            setStepIndex={setStepIndex}
            stepIndex={stepIndex}
          />
          <ErrorMessages />
          <GradingPanel />

          <div>
            <SaveGradeButton />
            <SaveDraftButton />

            <div style={{ display: 'inline', float: 'right' }}>
              <FinaliseButton />
            </div>

            <UnsubmitButton />
          </div>
        </form>
      </FormProvider>

      <WarningDialog
        isAttempting={attempting}
        isExamMode={false}
        isTimedMode={!!submissionTimeLimitAt}
        submissionTimeLimitAt={submissionTimeLimitAt}
      />
    </div>
  );
};

SubmissionEditStepForm.propTypes = {
  initialValues: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,

  assessment: PropTypes.object,
  attachments: PropTypes.arrayOf(attachmentShape),
  submissionTimeLimitAt: PropTypes.number,
  graderView: PropTypes.bool.isRequired,
  maxStep: PropTypes.number.isRequired,
  step: PropTypes.number,
  skippable: PropTypes.bool.isRequired,

  attempting: PropTypes.bool.isRequired,
  published: PropTypes.bool.isRequired,

  codaveriFeedbackStatus: PropTypes.object,
  explanations: PropTypes.objectOf(explanationShape),
  liveFeedback: PropTypes.object,
  allConsideredCorrect: PropTypes.bool.isRequired,
  allowPartialSubmission: PropTypes.bool.isRequired,
  showMcqAnswer: PropTypes.bool.isRequired,
  showMcqMrqSolution: PropTypes.bool.isRequired,
  isCodaveriEnabled: PropTypes.bool.isRequired,

  questionIds: PropTypes.arrayOf(PropTypes.number),
  questions: PropTypes.objectOf(questionShape),
  historyQuestions: PropTypes.objectOf(historyQuestionShape),
  questionsFlags: PropTypes.objectOf(questionFlagsShape),
  topics: PropTypes.objectOf(topicShape),
  isSaving: PropTypes.bool.isRequired,

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
};

function mapStateToProps(state) {
  return {
    assessment: state.assessments.submission.assessment,
    attachments: state.assessments.submission.attachments,
    liveFeedback: state.assessments.submission.liveFeedback,
  };
}

export default connect(mapStateToProps)(injectIntl(SubmissionEditStepForm));
