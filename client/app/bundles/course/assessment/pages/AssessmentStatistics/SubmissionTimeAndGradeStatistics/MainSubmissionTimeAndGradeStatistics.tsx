import { FC } from 'react';

import { useAppSelector } from 'lib/hooks/store';

import { getAssessmentStatistics } from '../selectors';

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

  return <SubmissionTimeAndGradeChart submissions={includedSubmissions} />;
};

export default MainSubmissionTimeAndGradeStatistics;
