import { AncestorAssessmentStats } from 'types/course/statistics/assessmentStatistics';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import { fetchAncestorStatistics } from '../../operations/statistics';

import StatisticsCharts from './StatisticsCharts';

interface AncestorStatisticsProps {
  currentAssessmentSelected: boolean;
  selectedAssessmentId: number;
}

const AncestorStatistics = (props: AncestorStatisticsProps): JSX.Element => {
  const { currentAssessmentSelected, selectedAssessmentId } = props;
  if (currentAssessmentSelected) {
    return <>&nbsp;</>;
  }

  const fetchAncestorStatisticsInfo = (): Promise<AncestorAssessmentStats> => {
    return fetchAncestorStatistics(selectedAssessmentId);
  };

  return (
    <Preload render={<LoadingIndicator />} while={fetchAncestorStatisticsInfo}>
      {(data): JSX.Element => (
        <StatisticsCharts
          allStudents={data.allStudents}
          submissions={data.submissions}
        />
      )}
    </Preload>
  );
};

export default AncestorStatistics;
