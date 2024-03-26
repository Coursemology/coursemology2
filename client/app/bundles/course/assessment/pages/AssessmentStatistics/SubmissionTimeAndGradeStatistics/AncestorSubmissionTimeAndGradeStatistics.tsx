import { FC } from 'react';
import { AncestorSubmissionInfo } from 'types/course/statistics/assessmentStatistics';

import SubmissionTimeAndGradeChart from './SubmissionTimeAndGradeChart';

interface Props {
  ancestorSubmissions: AncestorSubmissionInfo[];
}

const AncestorSubmissionTimeAndGradeStatistics: FC<Props> = (props) => {
  const { ancestorSubmissions } = props;

  return <SubmissionTimeAndGradeChart submissions={ancestorSubmissions} />;
};

export default AncestorSubmissionTimeAndGradeStatistics;
