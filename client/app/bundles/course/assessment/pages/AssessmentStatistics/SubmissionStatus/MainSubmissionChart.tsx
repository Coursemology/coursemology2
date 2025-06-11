import { useAppSelector } from 'lib/hooks/store';

import { getSubmissionStatistics } from '../selectors';

import SubmissionStatusChart from './SubmissionStatusChart';

interface Props {
  includePhantom: boolean;
}

const MainSubmissionChart = (props: Props): JSX.Element => {
  const { includePhantom } = props;

  const submissionStatistics = useAppSelector(getSubmissionStatistics);

  const includedSubmissions = includePhantom
    ? submissionStatistics
    : submissionStatistics.filter((s) => !s.courseUser.isPhantom);

  return <SubmissionStatusChart submissions={includedSubmissions} />;
};

export default MainSubmissionChart;
