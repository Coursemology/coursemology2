import { FC } from 'react';

import { useAppSelector } from 'lib/hooks/store';

import { getAssessmentStatistics } from '../selectors';

import GradesChart from './GradesChart';

interface Props {
  includePhantom: boolean;
}

const MainGradesChart: FC<Props> = (props) => {
  const { includePhantom } = props;

  const statistics = useAppSelector(getAssessmentStatistics);
  const submissions = statistics.submissions;
  const maximumGrade = statistics.assessment?.maximumGrade;
  const nonNullSubmissions = submissions.filter((s) => s.totalGrade);

  const includedSubmissions = includePhantom
    ? nonNullSubmissions
    : nonNullSubmissions.filter((s) => !s.courseUser.isPhantom);

  const totalGrades =
    includedSubmissions
      ?.filter((s) => s.totalGrade)
      ?.map((s) => s.totalGrade) ?? [];

  return <GradesChart maximumGrade={maximumGrade} totalGrades={totalGrades} />;
};

export default MainGradesChart;
