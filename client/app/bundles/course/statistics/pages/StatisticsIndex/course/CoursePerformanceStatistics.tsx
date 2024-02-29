import { FC } from 'react';
import { defineMessages } from 'react-intl';

import { CoursePerformanceIndex } from 'course/statistics/types';
import ErrorCard from 'lib/components/core/ErrorCard';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import useTranslation from 'lib/hooks/useTranslation';

import StudentPerformanceTable from './StudentPerformanceTable';

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
  courseProgressionFailure: {
    id: 'course.statistics.failures.courseProgression',
    defaultMessage: 'Failed to fetch course progression data!',
  },
  coursePerformanceFailure: {
    id: 'course.statistics.failures.coursePerformance',
    defaultMessage: 'Failed to fetch course performance data!',
  },
});

interface Props {
  statistics: CoursePerformanceIndex;
}

const CoursePerformanceStatistics: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { statistics } = props;

  const {
    hasPersonalizedTimeline,
    isCourseGamified,
    showVideo,
    courseVideoCount,
    courseAssessmentCount,
    courseAchievementCount,
    maxLevel,
    hasGroupManagers,
  } = statistics.metadata;

  if (statistics.isFetchingPerformance) {
    return <LoadingIndicator />;
  }
  if (statistics.isErrorPerformance) {
    return <ErrorCard message={t(translations.performanceError)} />;
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
      students={statistics.students}
    />
  );
};

export default CoursePerformanceStatistics;
