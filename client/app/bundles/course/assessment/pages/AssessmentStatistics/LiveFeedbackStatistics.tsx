import { FC } from 'react';
import { useParams } from 'react-router-dom';

import {
  fetchAssessmentStatistics,
  fetchLiveFeedbackStatistics,
} from 'course/assessment/operations/statistics';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import { useAppSelector } from 'lib/hooks/store';

import LiveFeedbackStatisticsTable from './LiveFeedbackStatisticsTable';
import {
  getAssessmentStatistics,
  getLiveFeedbackStatistics,
} from './selectors';

interface Props {
  includePhantom: boolean;
}

const LiveFeedbackStatistics: FC<Props> = ({ includePhantom }) => {
  const { assessmentId } = useParams();
  const parsedAssessmentId = parseInt(assessmentId!, 10);

  const assessmentStatistics = useAppSelector(getAssessmentStatistics);
  const liveFeedbackStatistics = useAppSelector(getLiveFeedbackStatistics);

  const fetchAndSetAssessmentAndLiveFeedbackStatistics =
    async (): Promise<void> => {
      const promises: Promise<void>[] = [];
      if (!assessmentStatistics) {
        promises.push(fetchAssessmentStatistics(parsedAssessmentId));
      }
      if (liveFeedbackStatistics.length === 0) {
        promises.push(fetchLiveFeedbackStatistics(parsedAssessmentId));
      }
      await Promise.all(promises);
    };

  return (
    <Preload
      render={<LoadingIndicator />}
      while={fetchAndSetAssessmentAndLiveFeedbackStatistics}
    >
      <LiveFeedbackStatisticsTable
        assessmentStatistics={assessmentStatistics}
        includePhantom={includePhantom}
        liveFeedbackStatistics={liveFeedbackStatistics}
      />
    </Preload>
  );
};

export default LiveFeedbackStatistics;
