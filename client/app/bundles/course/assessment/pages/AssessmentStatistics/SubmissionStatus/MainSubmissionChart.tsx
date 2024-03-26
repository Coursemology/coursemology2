import { useAppSelector } from 'lib/hooks/store';

import { getAssessmentStatistics } from '../selectors';

import SubmissionStatusChart from './SubmissionStatusChart';

interface Props {
  includePhantom: boolean;
}

const MainSubmissionChart = (props: Props): JSX.Element => {
  const { includePhantom } = props;
  const statistics = useAppSelector(getAssessmentStatistics);

  const submissions = statistics.submissions;

  const includedSubmissions = includePhantom
    ? submissions
    : submissions.filter((s) => !s.courseUser.isPhantom);

  return <SubmissionStatusChart submissions={includedSubmissions} />;
};

export default MainSubmissionChart;
