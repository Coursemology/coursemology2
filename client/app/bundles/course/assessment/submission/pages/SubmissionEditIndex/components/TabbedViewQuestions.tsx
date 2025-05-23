import { Dispatch, FC, SetStateAction } from 'react';
import { Paper, Step, StepButton, Stepper } from '@mui/material';

import { workflowStates } from 'course/assessment/submission/constants';
import { getAssessment } from 'course/assessment/submission/selectors/assessments';
import { getSubmission } from 'course/assessment/submission/selectors/submissions';
import { HistoryViewData } from 'course/assessment/submission/types';
import { useAppSelector } from 'lib/hooks/store';

import StepperButton from './button/StepperButton';
import QuestionContent from './QuestionContent';

interface Props {
  handleNext: () => void;
  maxStep: number;
  stepIndex: number;
  setStepIndex: Dispatch<SetStateAction<number>>;
  setHistoryInfo: Dispatch<SetStateAction<HistoryViewData>>;
}

const TabbedViewQuestions: FC<Props> = (props) => {
  const { handleNext, maxStep, stepIndex, setStepIndex, setHistoryInfo } =
    props;

  const assessment = useAppSelector(getAssessment);
  const submission = useAppSelector(getSubmission);

  const { autograded, skippable, questionIds } = assessment;
  const { workflowState, graderView } = submission;

  const published = workflowState === workflowStates.Published;

  const shouldRenderActiveStepper = (index: number): boolean => {
    return (
      !autograded || published || skippable || graderView || index <= maxStep
    );
  };

  const QuestionStepper: FC = () => {
    return (
      questionIds &&
      questionIds.length > 1 && (
        <Stepper
          activeStep={stepIndex}
          className="justify-center flex-wrap p-4 gap-y-10"
          connector={<div />}
          nonLinear
        >
          {questionIds.map((id, index) => {
            const isDisabled = !shouldRenderActiveStepper(index);
            return (
              <Step key={id} active={!autograded || index <= maxStep}>
                <StepButton
                  className="p-4"
                  disabled={isDisabled}
                  icon={
                    <StepperButton
                      disabled={isDisabled}
                      questionId={id}
                      questionIndex={index}
                      stepIndex={stepIndex}
                    />
                  }
                  onClick={() => setStepIndex(index)}
                />
              </Step>
            );
          })}
        </Stepper>
      )
    );
  };

  const openAnswerHistoryView = (
    questionId: number,
    questionNumber: number,
  ): void => {
    setHistoryInfo({
      open: true,
      questionId,
      questionNumber,
    });
  };

  return (
    <>
      <QuestionStepper />
      <Paper className="mb-5 p-6" variant="outlined">
        <QuestionContent
          handleNext={handleNext}
          openAnswerHistoryView={openAnswerHistoryView}
          stepIndex={stepIndex}
        />
      </Paper>
    </>
  );
};

export default TabbedViewQuestions;
