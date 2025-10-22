import { FC } from 'react';

import { AnswerTableEntry } from './types';

const TotalGradeCell: FC<{
  answer: AnswerTableEntry;
  maximumTotalGrade: number;
}> = ({ answer, maximumTotalGrade }) => (
  <div className="space-y-1">
    <p className="m-0 text-center w-full">
      {answer.evaluation?.totalGrade} / {maximumTotalGrade}
    </p>
  </div>
);

export default TotalGradeCell;
