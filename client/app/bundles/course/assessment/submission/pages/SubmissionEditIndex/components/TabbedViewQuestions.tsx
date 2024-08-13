import { Dispatch, FC, SetStateAction } from 'react';
import { Paper, Step, StepButton, StepLabel, Stepper } from '@mui/material';

import { workflowStates } from 'course/assessment/submission/constants';
import { getAssessment } from 'course/assessment/submission/selectors/assessments';
import { getSubmission } from 'course/assessment/submission/selectors/submissions';
import { useAppSelector } from 'lib/hooks/store';

import StepperButton from './button/StepperButton';
import QuestionContent from './QuestionContent';

interface Props {
  handleNext: () => void;
  maxStep: number;
  stepIndex: number;
  setStepIndex: Dispatch<SetStateAction<number>>;
}

const TabbedViewQuestions: FC<Props> = (props) => {
  const { handleNext, maxStep, stepIndex, setStepIndex } = props;

  const assessment = useAppSelector(getAssessment);
  const submission = useAppSelector(getSubmission);

  const { autograded, skippable, questionIds } = assessment;
  const { workflowState, graderView } = submission;

  const published = workflowState === workflowStates.Published;

  const questionId = questionIds[stepIndex];

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
          connector={<div />}
          nonLinear
          style={{ justifyContent: 'center', flexWrap: 'wrap', padding: 10 }}
        >
          {questionIds.map((id, index) => {
            if (shouldRenderActiveStepper(index)) {
              return (
                <Step key={questionId} active={!autograded || index <= maxStep}>
                  <StepButton
                    icon={
                      <StepperButton
                        questionId={id}
                        questionIndex={index}
                        stepIndex={stepIndex}
                      />
                    }
                    onClick={() => setStepIndex(index)}
                  />
                </Step>
              );
            }
            return (
              <Step key={id}>
                <StepLabel />
              </Step>
            );
          })}
        </Stepper>
      )
    );
  };

  return (
    <>
      <QuestionStepper />
      <Paper className="mb-5 p-6" variant="outlined">
        <QuestionContent handleNext={handleNext} stepIndex={stepIndex} />
      </Paper>
    </>
  );
};

export default TabbedViewQuestions;
