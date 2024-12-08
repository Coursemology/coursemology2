import { FC } from 'react';
import { ProgrammingQuestion } from 'types/course/admin/codaveri';

import CodaveriEvaluatorToggleButton from './CodaveriEvaluatorToggleButton';
import LiveFeedbackToggleButton from './LiveFeedbackToggleButton';

interface CodaveriToggleButtonsProps {
  programmingQuestions: ProgrammingQuestion[];
  for?: string;
  type: 'course' | 'category' | 'tab' | 'assessment' | 'question';
}

const CodaveriToggleButtons: FC<CodaveriToggleButtonsProps> = (props) => {
  const { programmingQuestions, for: title, type } = props;
  const className = `${type === 'question' ? 'pr-[0.65rem]' : 'pr-7'} space-x-8 flex justify-between`;

  return (
    <div className={className}>
      <CodaveriEvaluatorToggleButton
        for={title}
        programmingQuestions={programmingQuestions}
        type={type}
      />
      <LiveFeedbackToggleButton
        for={title}
        programmingQuestions={programmingQuestions}
        type={type}
      />
    </div>
  );
};

export default CodaveriToggleButtons;
