import { FC } from 'react';
import { AncestorSubmissionInfo } from 'types/course/statistics/assessmentStatistics';

import { processSubmission } from 'course/assessment/utils/statisticsUtils';

import { processSubmissionsIntoChartData } from '../utils';

import SubmissionTimeAndGradeChart from './SubmissionTimeAndGradeChart';

interface Props {
  ancestorSubmissions: AncestorSubmissionInfo[];
}

const AncestorSubmissionTimeAndGradeStatistics: FC<Props> = (props) => {
  const { ancestorSubmissions } = props;
  const mappedAncestorSubmissions = ancestorSubmissions.map(processSubmission);

  const { labels, lineData, barData } = processSubmissionsIntoChartData(
    mappedAncestorSubmissions,
  );
  const hasEndAt = ancestorSubmissions.every((s) => s.endAt);

  return (
    <SubmissionTimeAndGradeChart
      barData={barData}
      hasEndAt={hasEndAt}
      labels={labels}
      lineData={lineData}
    />
  );
};

export default AncestorSubmissionTimeAndGradeStatistics;
