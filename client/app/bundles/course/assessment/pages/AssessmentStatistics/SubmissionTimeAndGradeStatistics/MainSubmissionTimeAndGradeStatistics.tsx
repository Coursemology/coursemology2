import { FC } from 'react';

import { useAppSelector } from 'lib/hooks/store';

import { getAssessmentStatistics } from '../selectors';
import { processSubmissionsIntoChartData } from '../utils';

import SubmissionTimeAndGradeChart from './SubmissionTimeAndGradeChart';

interface Props {
  includePhantom: boolean;
}

const MainSubmissionTimeAndGradeStatistics: FC<Props> = (props) => {
  const { includePhantom } = props;
  const statistics = useAppSelector(getAssessmentStatistics);

  const submissions = statistics.submissions;

  const nonNullSubmissions = submissions.filter((s) => s.totalGrade);
  const includedSubmissions = includePhantom
    ? nonNullSubmissions
    : nonNullSubmissions.filter((s) => !s.courseUser.isPhantom);
  const { labels, lineData, barData } =
    processSubmissionsIntoChartData(includedSubmissions);
  const hasEndAt = includedSubmissions.every((s) => s.endAt);

  return (
    <SubmissionTimeAndGradeChart
      barData={barData}
      hasEndAt={hasEndAt}
      labels={labels}
      lineData={lineData}
    />
  );
};

export default MainSubmissionTimeAndGradeStatistics;
