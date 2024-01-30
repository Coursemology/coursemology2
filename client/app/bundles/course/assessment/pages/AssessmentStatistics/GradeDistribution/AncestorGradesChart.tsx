import { FC } from 'react';
import { AncestorSubmissionInfo } from 'types/course/statistics/assessmentStatistics';

import GradesChart from './GradesChart';

interface Props {
  ancestorSubmissions: AncestorSubmissionInfo[];
}

const AncestorGradesChart: FC<Props> = (props) => {
  const { ancestorSubmissions } = props;

  const totalGrades =
    ancestorSubmissions
      ?.filter((s) => s.totalGrade)
      ?.map((s) => s.totalGrade) ?? [];

  return <GradesChart totalGrades={totalGrades} />;
};

export default AncestorGradesChart;
