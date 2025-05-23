import { FC } from 'react';
import { SvgIcon } from '@mui/material';
import { blue, green, lightBlue, red } from '@mui/material/colors';
import { grey } from 'theme/colors';

import { getExplanations } from 'course/assessment/submission/selectors/explanations';
import { useAppSelector } from 'lib/hooks/store';

interface Props {
  questionId: number;
  questionIndex: number;
  stepIndex: number;
  disabled?: boolean;
}

const StepperButton: FC<Props> = (props) => {
  const { questionId, questionIndex, stepIndex, disabled = false } = props;

  const explanations = useAppSelector(getExplanations);

  let stepButtonColor = '';
  const isCurrentQuestion = questionIndex === stepIndex;
  if (disabled) {
    stepButtonColor = grey[400];
  } else if (explanations[questionId]?.correct) {
    stepButtonColor = isCurrentQuestion ? green[700] : green[300];
  } else if (explanations[questionId]?.correct === false) {
    stepButtonColor = isCurrentQuestion ? red[700] : red[300];
  } else {
    stepButtonColor = isCurrentQuestion ? blue[800] : lightBlue[400];
  }
  return (
    <SvgIcon
      fontSize={isCurrentQuestion ? 'large' : 'medium'}
      htmlColor={stepButtonColor}
    >
      <circle cx="12" cy="12" r="12" />
      <text fill="#fff" fontSize="12" textAnchor="middle" x="12" y="16">
        {questionIndex + 1}
      </text>
    </SvgIcon>
  );
};

export default StepperButton;
