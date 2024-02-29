import { FC, useEffect } from 'react';
import { defineMessages } from 'react-intl';

import { fetchStudentsStatistics } from 'course/statistics/operations';
import { getStudentStatistics } from 'course/statistics/selectors';
import ErrorCard from 'lib/components/core/ErrorCard';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Note from 'lib/components/core/Note';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import StatisticsTabs from '../StatisticsTabs';

import StudentsStatisticsTable from './StudentsStatisticsTable';

const translations = defineMessages({
  error: {
    id: 'course.statistics.StatisticsIndex.students.error',
    defaultMessage:
      'Something went wrong when fetching student statistics! Please refresh to try again.',
  },
  noStudents: {
    id: 'course.statistics.StatisticsIndex.students.noStudents',
    defaultMessage: 'There is no student in this course, yet...',
  },
  studentsFailure: {
    id: 'course.statistics.StatisticsIndex.studentsFailure',
    defaultMessage: 'Failed to fetch student data!',
  },
});

const StudentsStatistics: FC = () => {
  const { t } = useTranslation();
  const statistics = useAppSelector(getStudentStatistics);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchStudentsStatistics(t(translations.studentsFailure)));
  }, [dispatch]);

  if (statistics.isFetching) {
    return <LoadingIndicator />;
  }
  if (statistics.isError) {
    return <ErrorCard message={t(translations.error)} />;
  }
  if (statistics.students.length === 0) {
    return <Note message={t(translations.noStudents)} />;
  }

  return (
    <>
      <StatisticsTabs />
      <StudentsStatisticsTable
        metadata={statistics.metadata}
        students={statistics.students}
      />
    </>
  );
};

export default StudentsStatistics;
