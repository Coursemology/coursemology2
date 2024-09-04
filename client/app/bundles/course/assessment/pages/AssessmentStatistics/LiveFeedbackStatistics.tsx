import { FC, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AssessmentLiveFeedbackStatistics } from 'types/course/statistics/assessmentStatistics';

import { fetchLiveFeedbackStatistics } from 'course/assessment/operations/statistics';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import LiveFeedbackStatisticsTable from './LiveFeedbackStatisticsTable';

interface Props {
  includePhantom: boolean;
}

const LiveFeedbackStatistics: FC<Props> = (props) => {
  const { assessmentId } = useParams();
  const parsedAssessmentId = parseInt(assessmentId!, 10);
  const { includePhantom } = props;

  const [liveFeedbackStatistics, setLiveFeedbackStatistics] = useState<
    AssessmentLiveFeedbackStatistics[]
  >([]);

  const fetchAndSetLiveFeedbackStatistics = (): Promise<void> =>
    fetchLiveFeedbackStatistics(parsedAssessmentId).then(
      setLiveFeedbackStatistics,
    );

  return (
    <Preload
      render={<LoadingIndicator />}
      while={fetchAndSetLiveFeedbackStatistics}
    >
      {(): JSX.Element => (
        <LiveFeedbackStatisticsTable
          includePhantom={includePhantom}
          liveFeedbackStatistics={liveFeedbackStatistics}
        />
      )}
    </Preload>
  );
};

export default LiveFeedbackStatistics;
