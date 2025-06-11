import { FC, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import { useAppSelector } from 'lib/hooks/store';

import { fetchSubmissionStatistics } from '../../../operations/statistics';
import { getSubmissionStatistics } from '../selectors';

import GradesChart from './GradesChart';

interface Props {
  includePhantom: boolean;
}

const MainGradesChart: FC<Props> = ({ includePhantom }) => {
  const { assessmentId } = useParams();
  const parsedAssessmentId = parseInt(assessmentId!, 10);

  const submissionStatistics = useAppSelector(getSubmissionStatistics);

  const fetchAndSetSubmissionStatistics = async (): Promise<void> => {
    if (submissionStatistics.length > 0) return;
    await fetchSubmissionStatistics(parsedAssessmentId);
  };

  const { maximumGrade, totalGrades } = useMemo(() => {
    const filteredSubmissionStatistics = submissionStatistics.filter(
      (s) => s.totalGrade && (includePhantom || !s.courseUser.isPhantom),
    );

    return {
      maximumGrade: submissionStatistics[0]?.maximumGrade ?? 0,
      totalGrades: filteredSubmissionStatistics.map((s) => s.totalGrade!),
    };
  }, [submissionStatistics, includePhantom]);

  return (
    <Preload
      render={<LoadingIndicator />}
      while={fetchAndSetSubmissionStatistics}
    >
      <GradesChart maximumGrade={maximumGrade} totalGrades={totalGrades} />
    </Preload>
  );
};

export default MainGradesChart;
