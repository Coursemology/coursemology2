import { FC } from 'react';

import {
  questionTypes,
  workflowStates,
} from 'course/assessment/submission/constants';
import { getAssessment } from 'course/assessment/submission/selectors/assessments';
import { getQuestions } from 'course/assessment/submission/selectors/questions';
import { getSubmission } from 'course/assessment/submission/selectors/submissions';
import { useAppSelector } from 'lib/hooks/store';

import ContinueButton from './button/ContinueButton';
import LiveFeedbackButton from './button/LiveFeedbackButton';
import ResetAnswerButton from './button/ResetAnswerButton';
import RunCodeButton from './button/RunCodeButton';
import SubmitButton from './button/SubmitButton';

interface Props {
  handleNext: () => void;
  stepIndex: number;
}

const ActionButtonsRow: FC<Props> = (props) => {
  const { handleNext, stepIndex } = props;

  const assessment = useAppSelector(getAssessment);
  const submission = useAppSelector(getSubmission);
  const questions = useAppSelector(getQuestions);

  const { questionIds } = assessment;
  const { workflowState } = submission;

  const attempting = workflowState === workflowStates.Attempting;

  const questionId = questionIds[stepIndex];
  const question = questions[questionId];

  const leftAlignedButtons = [
    <ResetAnswerButton key="reset" questionId={questionId} />,
    !assessment.autograded &&
      question.type === questionTypes.Programming &&
      question.autogradable && (
        <RunCodeButton key="run-code" questionId={questionId} />
      ),
    assessment.autograded && (
      <SubmitButton key="submit" questionId={questionId} />
    ),
    assessment.autograded && (
      <ContinueButton
        key="continue"
        onContinue={handleNext}
        stepIndex={stepIndex}
      />
    ),
  ].filter(Boolean);

  const rightAlignedButtons = [
    question.type === questionTypes.Programming &&
      question.liveFeedbackEnabled && (
        <LiveFeedbackButton key="get-help" answerId={question.answerId} />
      ),
  ].filter(Boolean);

  return (
    attempting && (
      <div className="flex flex-nowrap">
        {leftAlignedButtons}
        <div className="flex-1 w-full" />
        {rightAlignedButtons}
      </div>
    )
  );
};

export default ActionButtonsRow;
