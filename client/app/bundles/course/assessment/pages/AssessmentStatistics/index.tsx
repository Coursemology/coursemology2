import { useEffect } from 'react';
import { defineMessages } from 'react-intl';
import { useParams } from 'react-router-dom';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import { useAppDispatch } from 'lib/hooks/store';

import { fetchAssessmentStatistics } from '../../operations/statistics';
import { statisticsActions } from '../../reducers/statistics';

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
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Reset statistics state when assessmentId changes
    dispatch(statisticsActions.reset());
  }, [assessmentId, dispatch]);

  const fetchAndSetAssessmentStatistics = (): Promise<void> =>
    fetchAssessmentStatistics(parsedAssessmentId);

  return (
    <Preload
      render={<LoadingIndicator />}
      while={fetchAndSetAssessmentStatistics}
    >
      <AssessmentStatisticsPage />
    </Preload>
  );
};

const handle = translations.statistics;
export default Object.assign(AssessmentStatistics, { handle });
