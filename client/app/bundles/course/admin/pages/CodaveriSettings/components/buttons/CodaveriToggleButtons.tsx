import { FC } from 'react';

import CodaveriEvaluatorToggleButton from './CodaveriEvaluatorToggleButton';
import LiveFeedbackToggleButton from './LiveFeedbackToggleButton';

interface CodaveriToggleButtonsProps {
  assessmentIds: number[];
  for: string;
  type: 'course' | 'category' | 'tab' | 'assessment';
}

const CodaveriToggleButtons: FC<CodaveriToggleButtonsProps> = (props) => {
  const { assessmentIds, for: title, type } = props;

  return (
    <div className="pr-7 space-x-8 flex justify-between">
      <CodaveriEvaluatorToggleButton
        assessmentIds={assessmentIds}
        for={title}
        type={type}
      />
      <LiveFeedbackToggleButton assessmentIds={assessmentIds} for={title} />
    </div>
  );
};

export default CodaveriToggleButtons;
