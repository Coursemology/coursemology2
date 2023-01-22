import { defineMessages, useIntl } from 'react-intl';

import ErrorCard from 'lib/components/core/ErrorCard';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Note from 'lib/components/core/Note';

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
  const intl = useIntl();

  if (isFetching) {
    return <LoadingIndicator />;
  }
  if (isError) {
    return <ErrorCard message={intl.formatMessage(translations.error)} />;
  }
  if (students.length === 0) {
    return <Note message={intl.formatMessage(translations.error)} />;
  }

  return <StudentsStatisticsTable metadata={metadata} students={students} />;
};

StudentsStatistics.propTypes = studentsIndexShape;

export default StudentsStatistics;
