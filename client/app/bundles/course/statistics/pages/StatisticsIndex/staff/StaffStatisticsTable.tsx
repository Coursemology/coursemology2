import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Typography } from '@mui/material';

import { Staff } from 'course/statistics/types';
import { processStaff } from 'course/statistics/utils/parseStaffResponse';
import Table, { ColumnTemplate } from 'lib/components/table';
import { DEFAULT_TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  name: {
    id: 'course.statistics.StatisticsIndex.staff.name',
    defaultMessage: 'Name',
  },
  numGraded: {
    id: 'course.statistics.StatisticsIndex.staff.numGraded',
    defaultMessage: '# Marked',
  },
  numStudents: {
    id: 'course.statistics.StatisticsIndex.staff.numStudents',
    defaultMessage: '# Students',
  },
  csvFileTitle: {
    id: 'course.statistics.StatisticsIndex.staff.csvFileTitle',
    defaultMessage: 'Staff Statistics',
  },
  averageMarkingTime: {
    id: 'course.statistics.StatisticsIndex.staff.averageMarkingTime',
    defaultMessage: 'Avg Time / Assessment',
  },
  stddev: {
    id: 'course.statistics.StatisticsIndex.staff.stddev',
    defaultMessage: 'Stdev Time / Assessment',
  },
  tableTitle: {
    id: 'course.statistics.StatisticsIndex.staff.tableTitle',
    defaultMessage: 'Staff Statistics',
  },
  searchBar: {
    id: 'course.statistics.StatisticsIndex.staff.searchBar',
    defaultMessage: 'Search by Staff Name',
  },
});

interface Props {
  staffs: Staff[];
}

const StaffStatisticsTable: FC<Props> = (props) => {
  const { staffs } = props;
  const { t } = useTranslation();
  const formattedStaffs = staffs.map(processStaff);

  const columns: ColumnTemplate<Staff>[] = [
    {
      of: 'name',
      title: t(translations.name),
      sortable: true,
      searchable: true,
      csvDownloadable: true,
      cell: (staff) => staff.name,
    },
    {
      of: 'numGraded',
      title: t(translations.numGraded),
      sortable: true,
      csvDownloadable: true,
      cell: (staff) => <div className="text-right">{staff.numGraded}</div>,
      className: 'text-right',
    },
    {
      of: 'numStudents',
      title: t(translations.numStudents),
      sortable: true,
      csvDownloadable: true,
      cell: (staff) => <div className="text-right">{staff.numStudents}</div>,
      className: 'text-right',
    },
    {
      of: 'averageMarkingTime',
      title: t(translations.averageMarkingTime),
      sortable: true,
      csvDownloadable: true,
      cell: (staff) => staff.averageMarkingTime,
    },
    {
      of: 'stddev',
      title: t(translations.stddev),
      sortable: true,
      csvDownloadable: true,
      cell: (staff) => staff.stddev,
    },
  ];

  return (
    <>
      <Typography className="ml-2" variant="h6">
        {t(translations.tableTitle)}
      </Typography>
      <Table
        className="border-none"
        columns={columns}
        csvDownload={{ filename: t(translations.csvFileTitle) }}
        data={formattedStaffs}
        getRowClassName={(staff): string => `staff_statistics_${staff.id}`}
        getRowEqualityData={(staff): Staff => staff}
        getRowId={(staff): string => staff.id.toString()}
        indexing={{ indices: true }}
        pagination={{
          rowsPerPage: [DEFAULT_TABLE_ROWS_PER_PAGE],
          showAllRows: true,
        }}
        search={{
          searchPlaceholder: t(translations.searchBar),
          searchProps: {
            shouldInclude: (staff, filterValue?: string): boolean => {
              if (!staff.name) return false;
              if (!filterValue) return true;

              return staff.name
                .toLowerCase()
                .trim()
                .includes(filterValue.toLowerCase().trim());
            },
          },
        }}
        toolbar={{ show: true }}
      />
    </>
  );
};

export default StaffStatisticsTable;
