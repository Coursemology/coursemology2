import { defineMessages, useIntl } from 'react-intl';

import ErrorCard from 'lib/components/core/ErrorCard';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';

import { courseIndexShape } from '../../../propTypes/course';

import StudentPerformanceTable from './StudentPerformanceTable';
import StudentProgressionChart from './StudentProgressionChart';

const translations = defineMessages({
  error: {
    id: 'course.statistics.StatisticsIndex.course.error',
    defaultMessage:
      'Something went wrong when fetching course statistics! Please refresh to try again.',
  },
  progressionError: {
    id: 'course.statistics.StatisticsIndex.course.progressionError',
    defaultMessage:
      'Something went wrong when fetching course progression statistics! Please refresh to try again.',
  },
  performanceError: {
    id: 'course.statistics.StatisticsIndex.course.performanceError',
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
  metadata,
}) => {
  const {
    hasPersonalizedTimeline,
    isCourseGamified,
    showVideo,
    courseVideoCount,
    courseAssessmentCount,
    courseAchievementCount,
    maxLevel,
    hasGroupManagers,
  } = metadata;
  const intl = useIntl();
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
        courseAchievementCount={courseAchievementCount}
        courseAssessmentCount={courseAssessmentCount}
        courseVideoCount={courseVideoCount}
        hasGroupManagers={hasGroupManagers}
        hasPersonalizedTimeline={hasPersonalizedTimeline}
        isCourseGamified={isCourseGamified}
        maxLevel={maxLevel}
        showVideo={showVideo}
        students={students}
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

export default CourseStatistics;
