import { defineMessages } from 'react-intl';

import ErrorCard from 'lib/components/core/ErrorCard';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Note from 'lib/components/core/Note';
import useTranslation from 'lib/hooks/useTranslation';

import { studentsIndexShape } from '../../../propTypes/students';

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
});

const StudentsStatistics = ({ metadata, students, isFetching, isError }) => {
  const { t } = useTranslation();

  if (isFetching) {
    return <LoadingIndicator />;
  }
  if (isError) {
    return <ErrorCard message={t(translations.error)} />;
  }
  if (students.length === 0) {
    return <Note message={t(translations.noStudents)} />;
  }

  return <StudentsStatisticsTable metadata={metadata} students={students} />;
};

StudentsStatistics.propTypes = studentsIndexShape;

export default StudentsStatistics;
