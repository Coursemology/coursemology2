import { FC } from 'react';
import { AncestorSubmissionInfo } from 'types/course/statistics/assessmentStatistics';

import GradesChart from './GradesChart';

interface Props {
  ancestorSubmissions: AncestorSubmissionInfo[];
}

const AncestorGradesChart: FC<Props> = (props) => {
  const { ancestorSubmissions } = props;

  const gradedSubmissions =
    ancestorSubmissions?.filter((s) => s.totalGrade) ?? [];
  const totalGrades = gradedSubmissions.map((s) =>
    parseFloat(s.totalGrade as unknown as string),
  );
  const maximumGrade = gradedSubmissions[0]?.maximumGrade ?? undefined;

  return <GradesChart maximumGrade={maximumGrade} totalGrades={totalGrades} />;
};

export default AncestorGradesChart;
