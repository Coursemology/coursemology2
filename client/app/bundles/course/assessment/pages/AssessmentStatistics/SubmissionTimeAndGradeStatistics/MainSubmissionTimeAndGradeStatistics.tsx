import { FC, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import { useAppSelector } from 'lib/hooks/store';

import { fetchSubmissionStatistics } from '../../../operations/statistics';
import { getSubmissionStatistics } from '../selectors';

import SubmissionTimeAndGradeChart from './SubmissionTimeAndGradeChart';

interface Props {
  includePhantom: boolean;
}

const MainSubmissionTimeAndGradeStatistics: FC<Props> = ({
  includePhantom,
}) => {
  const { assessmentId } = useParams();
  const parsedAssessmentId = parseInt(assessmentId!, 10);

  const submissionStatistics = useAppSelector(getSubmissionStatistics);

  const fetchAndSetSubmissionStatistics = async (): Promise<void> => {
    if (submissionStatistics.length > 0) return;
    await fetchSubmissionStatistics(parsedAssessmentId);
  };

  const includedSubmissions = useMemo(() => {
    return submissionStatistics.filter(
      (s) => s.totalGrade && (includePhantom || !s.courseUser.isPhantom),
    );
  }, [submissionStatistics, includePhantom]);

  return (
    <Preload
      render={<LoadingIndicator />}
      while={fetchAndSetSubmissionStatistics}
    >
      <SubmissionTimeAndGradeChart submissions={includedSubmissions} />
    </Preload>
  );
};

export default MainSubmissionTimeAndGradeStatistics;
