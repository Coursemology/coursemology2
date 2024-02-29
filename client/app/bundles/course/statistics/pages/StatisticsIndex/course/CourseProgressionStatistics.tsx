import { FC, useEffect } from 'react';
import { defineMessages } from 'react-intl';

import { fetchCourseProgressionStatistics } from 'course/statistics/operations';
import { CourseProgressionIndex } from 'course/statistics/types';
import ErrorCard from 'lib/components/core/ErrorCard';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

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
  statistics: CourseProgressionIndex;
}

const CourseProgressionStatistics: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { statistics } = props;
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(
      fetchCourseProgressionStatistics(
        t(translations.courseProgressionFailure),
      ),
    );
  }, [dispatch]);

  if (statistics.isFetchingProgression) {
    return <LoadingIndicator />;
  }

  if (statistics.isErrorProgression) {
    return <ErrorCard message={t(translations.progressionError)} />;
  }
  return (
    <StudentProgressionChart
      assessments={statistics.assessments}
      submissions={statistics.submissions}
    />
  );
};

export default CourseProgressionStatistics;
