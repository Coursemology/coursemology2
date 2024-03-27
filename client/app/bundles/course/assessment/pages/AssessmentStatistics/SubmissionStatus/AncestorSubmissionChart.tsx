import { AncestorSubmissionInfo } from 'types/course/statistics/assessmentStatistics';

import SubmissionStatusChart from './SubmissionStatusChart';

interface Props {
  ancestorSubmissions: AncestorSubmissionInfo[];
}

const AncestorSubmissionChart = (props: Props): JSX.Element => {
  const { ancestorSubmissions } = props;

  return <SubmissionStatusChart submissions={ancestorSubmissions} />;
};

export default AncestorSubmissionChart;
