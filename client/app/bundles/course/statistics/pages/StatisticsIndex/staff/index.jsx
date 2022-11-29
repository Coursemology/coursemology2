import { useMemo } from 'react';
import { defineMessages, injectIntl } from 'react-intl';

import ErrorCard from 'lib/components/core/ErrorCard';
import DataTable from 'lib/components/core/layouts/DataTable';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';

import { staffIndexShape } from '../../../propTypes/staff';

const options = {
  downloadOptions: {
    filename: 'staff_statistics',
  },
  print: false,
  rowsPerPage: TABLE_ROWS_PER_PAGE,
  rowsPerPageOptions: [TABLE_ROWS_PER_PAGE],
  selectableRows: 'none',
  sortOrder: {
    name: 'averageMarkingTime',
    direction: 'asc',
  },
};

const translations = defineMessages({
  error: {
    id: 'course.statistics.staff.error',
    defaultMessage:
      'Something went wrong when fetching staff statistics! Please refresh to try again.',
  },
  name: {
    id: 'course.statistics.staff.name',
    defaultMessage: 'Name',
  },
  numGraded: {
    id: 'course.statistics.staff.numGraded',
    defaultMessage: '# Marked',
  },
  numStudents: {
    id: 'course.statistics.staff.numStudents',
    defaultMessage: '# Students',
  },
  averageMarkingTime: {
    id: 'course.statistics.staff.averageMarkingTime',
    defaultMessage: 'Avg Time / Assessment',
  },
  stddev: {
    id: 'course.statistics.staff.stddev',
    defaultMessage: 'Standard Deviation',
  },
  tableTitle: {
    id: 'course.statistics.staff.tableTitle',
    defaultMessage: 'Staff Statistics',
  },
});

const StaffStatistics = ({ staff, isFetching, isError, intl }) => {
  const columns = useMemo(
    () => [
      {
        name: 'name',
        label: intl.formatMessage(translations.name),
        options: {
          filter: false,
          sort: true,
        },
      },
      {
        name: 'numGraded',
        label: intl.formatMessage(translations.numGraded),
        options: {
          filter: false,
          sort: true,
          alignCenter: true,
        },
      },
      {
        name: 'numStudents',
        label: intl.formatMessage(translations.numStudents),
        options: {
          filter: false,
          sort: true,
          alignCenter: true,
        },
      },
      {
        name: 'averageMarkingTime',
        label: intl.formatMessage(translations.averageMarkingTime),
        options: {
          filter: false,
          sort: true,
        },
      },
      {
        name: 'stddev',
        label: intl.formatMessage(translations.stddev),
        options: {
          filter: false,
          sort: true,
        },
      },
    ],
    [intl],
  );

  if (isFetching) {
    return <LoadingIndicator />;
  }
  if (isError) {
    return <ErrorCard message={intl.formatMessage(translations.error)} />;
  }

  return (
    <DataTable
      columns={columns}
      data={staff}
      height="30px"
      includeRowNumber
      options={options}
      title={intl.formatMessage(translations.tableTitle)}
    />
  );
};

StaffStatistics.propTypes = staffIndexShape;

export default injectIntl(StaffStatistics);
