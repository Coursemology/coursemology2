import { defineMessages, FormattedMessage } from 'react-intl';

import {
  CourseUserShape,
  SubmissionRecordShape,
} from 'course/assessment/types';
import ErrorCard from 'lib/components/core/ErrorCard';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';

import StatisticsCharts from './StatisticsCharts';

const translations = defineMessages({
  fetchAncestorStatisticsFailure: {
    id: 'course.assessment.statistics.ancestorStatisticsFail',
    defaultMessage: "Failed to fetch ancestor's statistics.",
  },
});

interface AncestorStatisticsProps {
  ancestorAllStudents: CourseUserShape[];
  ancestorSubmissions: SubmissionRecordShape[];
  isErrorAncestorStatistics: boolean;
  isFetchingAncestorStatistics: boolean;
  currentAssessmentSelected: boolean;
}

const AncestorStatistics = (props: AncestorStatisticsProps): JSX.Element => {
  const {
    ancestorAllStudents,
    ancestorSubmissions,
    isErrorAncestorStatistics,
    isFetchingAncestorStatistics,
    currentAssessmentSelected,
  } = props;
  if (currentAssessmentSelected) {
    return <>&nbsp;</>;
  }
  if (isFetchingAncestorStatistics) {
    return <LoadingIndicator />;
  }
  if (isErrorAncestorStatistics) {
    return (
      <ErrorCard
        message={
          <FormattedMessage {...translations.fetchAncestorStatisticsFailure} />
        }
      />
    );
  }
  return (
    <StatisticsCharts
      allStudents={ancestorAllStudents}
      submissions={ancestorSubmissions}
    />
  );
};

export default AncestorStatistics;
