import { FC, useEffect } from 'react';
import { defineMessages } from 'react-intl';

import {
  fetchCoursePerformanceStatistics,
  fetchCourseProgressionStatistics,
} from 'course/statistics/operations';
import {
  getCoursePerformanceStatistics,
  getCourseProgressionStatistics,
} from 'course/statistics/selectors';
import ErrorCard from 'lib/components/core/ErrorCard';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import CoursePerformanceStatistics from './CoursePerformanceStatistics';
import CourseProgressionStatistics from './CourseProgressionStatistics';

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

const CourseStatistics: FC = () => {
  const { t } = useTranslation();
  const progressionStats = useAppSelector(getCourseProgressionStatistics);
  const performanceStats = useAppSelector(getCoursePerformanceStatistics);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(
      fetchCourseProgressionStatistics(
        t(translations.courseProgressionFailure),
      ),
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchCoursePerformanceStatistics(
        t(translations.coursePerformanceFailure),
      ),
    );
  }, [dispatch]);

  if (
    progressionStats.isFetchingProgression &&
    performanceStats.isFetchingPerformance
  ) {
    return <LoadingIndicator />;
  }

  if (
    progressionStats.isErrorProgression &&
    performanceStats.isErrorPerformance
  ) {
    return <ErrorCard message={t(translations.error)} />;
  }

  return (
    <>
      <CourseProgressionStatistics statistics={progressionStats} />
      <CoursePerformanceStatistics statistics={performanceStats} />
    </>
  );
};

export default CourseStatistics;
