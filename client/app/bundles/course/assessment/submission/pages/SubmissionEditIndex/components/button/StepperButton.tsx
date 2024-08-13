import { FC } from 'react';
import { SvgIcon } from '@mui/material';
import { blue, green, lightBlue, red } from '@mui/material/colors';

import { getExplanations } from 'course/assessment/submission/selectors/explanations';
import { useAppSelector } from 'lib/hooks/store';

interface Props {
  questionId: number;
  questionIndex: number;
  stepIndex: number;
}

const StepperButton: FC<Props> = (props) => {
  const { questionId, questionIndex, stepIndex } = props;

  const explanations = useAppSelector(getExplanations);

  let stepButtonColor = '';
  const isCurrentQuestion = questionIndex === stepIndex;
  if (explanations[questionId]?.correct) {
    stepButtonColor = isCurrentQuestion ? green[700] : green[300];
  } else if (explanations[questionId]?.correct === false) {
    stepButtonColor = isCurrentQuestion ? red[700] : red[300];
  } else {
    stepButtonColor = isCurrentQuestion ? blue[800] : lightBlue[400];
  }
  return (
    <SvgIcon htmlColor={stepButtonColor}>
      <circle cx="12" cy="12" r="12" />
      <text fill="#fff" fontSize="12" textAnchor="middle" x="12" y="16">
        {questionIndex + 1}
      </text>
    </SvgIcon>
  );
};

export default StepperButton;
