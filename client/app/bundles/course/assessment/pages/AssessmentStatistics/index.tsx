import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';
import { MainAssessmentStats } from 'types/course/statistics/assessmentStatistics';

import { fetchAssessmentStatistics } from 'course/assessment/operations/statistics';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';

import AssessmentStatisticsPage from './AssessmentStatisticsPage';

const translations = defineMessages({
  statistics: {
    id: 'course.assessment.statistics.statistics',
    defaultMessage: 'Statistics',
  },
});

const AssessmentStatistics = (): JSX.Element => {
  const { assessmentId } = useParams();
  const parsedAssessmentId = parseInt(assessmentId!, 10);

  const fetchAssessmentStatisticsDetails = (): Promise<MainAssessmentStats> =>
    fetchAssessmentStatistics(parsedAssessmentId);

  return (
    <Preload
      render={<LoadingIndicator />}
      while={fetchAssessmentStatisticsDetails}
    >
      {(_): JSX.Element => <AssessmentStatisticsPage />}
    </Preload>
  );
};

const handle = translations.statistics;
export default Object.assign(AssessmentStatistics, { handle });
