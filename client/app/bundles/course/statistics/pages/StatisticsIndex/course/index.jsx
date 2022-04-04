import { injectIntl, defineMessages } from 'react-intl';

import LoadingIndicator from 'lib/components/LoadingIndicator';
import ErrorCard from 'lib/components/ErrorCard';

import StudentProgressionChart from './StudentProgressionChart';
import StudentPerformanceTable from './StudentPerformanceTable';
import { courseIndexShape } from '../../../propTypes/course';

const translations = defineMessages({
  error: {
    id: 'course.statistics.course.error',
    defaultMessage:
      'Something went wrong when fetching course statistics! Please refresh to try again.',
  },
  progressionError: {
    id: 'course.statistics.course.progressionError',
    defaultMessage:
      'Something went wrong when fetching course progression statistics! Please refresh to try again.',
  },
  performanceError: {
    id: 'course.statistics.course.performanceError',
    defaultMessage:
      'Something went wrong when fetching course performance statistics! Please refresh to try again.',
  },
});

const CourseStatistics = ({
  isFetchingProgression,
  isFetchingPerformance,
  isErrorProgression,
  isErrorPerformance,
  assessments,
  submissions,
  students,
  hasPersonalizedTimeline,
  isCourseGamified,
  showVideo,
  courseVideoCount,
  intl,
}) => {
  if (isFetchingProgression && isFetchingPerformance) {
    return <LoadingIndicator />;
  }
  if (isErrorProgression && isErrorPerformance) {
    return <ErrorCard message={intl.formatMessage(translations.error)} />;
  }

  const renderProgression = () => {
    if (isFetchingProgression) {
      return <LoadingIndicator />;
    }
    if (isErrorProgression) {
      return (
        <ErrorCard
          message={intl.formatMessage(translations.progressionError)}
        />
      );
    }
    return (
      <StudentProgressionChart
        assessments={assessments}
        submissions={submissions}
      />
    );
  };

  const renderPerformance = () => {
    if (isFetchingPerformance) {
      return <LoadingIndicator />;
    }
    if (isErrorPerformance) {
      return (
        <ErrorCard
          message={intl.formatMessage(translations.performanceError)}
        />
      );
    }
    return (
      <StudentPerformanceTable
        students={students}
        hasPersonalizedTimeline={hasPersonalizedTimeline}
        isCourseGamified={isCourseGamified}
        showVideo={showVideo}
        courseVideoCount={courseVideoCount}
      />
    );
  };

  return (
    <>
      {renderProgression()}
      {renderPerformance()}
    </>
  );
};

CourseStatistics.propTypes = courseIndexShape;

export default injectIntl(CourseStatistics);
