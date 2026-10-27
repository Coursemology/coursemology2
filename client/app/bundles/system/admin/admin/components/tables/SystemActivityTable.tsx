import { FC } from 'react';
import { Tooltip, Typography } from '@mui/material';
import {
  ActivityGranularity,
  InstanceActivityCounts,
} from 'types/system/activities';

import Link from 'lib/components/core/Link';
import Table, { ColumnTemplate } from 'lib/components/table';
import { DEFAULT_TABLE_ROWS_PER_PAGE } from 'lib/constants/sharedConstants';
import useTranslation from 'lib/hooks/useTranslation';
import tableTranslations from 'lib/translations/table';

import translations from '../../translations/activityStatistics';

export const OVERALL_ROW_KEY = 'overall';

interface ActivityRow {
  key: string;
  name: string;
  host: string;
  counts: (number | null)[];
}

interface SystemActivityTableProps {
  overall: (number | null)[];
  instances: InstanceActivityCounts[];
  granularity: ActivityGranularity;
  bucketLabels: string[];
  /** The bucket still in progress, or -1. Its header is marked with an asterisk. */
  inProgressIndex: number;
  selectedKey: string;
  csvFileName: string;
  onSelect: (rowKey: string) => void;
}

// Not-yet-started buckets (null) sort below every real count, including 0.
const compareCounts = (a: number | null, b: number | null): number =>
  (a ?? -1) - (b ?? -1);

// Keeps the Overall row first whichever way a column is sorted. TanStack reverses a comparator's
// result for descending sorts, but rows that compare equal fall back to their order in `data`
// without that reversal, and Overall is the first row there.
const keepOverallFirst =
  (compare: (a: ActivityRow, b: ActivityRow) => number) =>
  (a: ActivityRow, b: ActivityRow): number =>
    a.key === OVERALL_ROW_KEY || b.key === OVERALL_ROW_KEY ? 0 : compare(a, b);

const SystemActivityTable: FC<SystemActivityTableProps> = (props) => {
  const {
    overall,
    instances,
    granularity,
    bucketLabels,
    inProgressIndex,
    selectedKey,
    csvFileName,
  } = props;
  const { t } = useTranslation();

  const rows: ActivityRow[] = [
    {
      key: OVERALL_ROW_KEY,
      name: t(translations.overall),
      host: '',
      counts: overall,
    },
    ...instances.map((instance) => ({
      key: instance.id.toString(),
      name: instance.name,
      host: instance.host,
      counts: instance.counts,
    })),
  ];

  const currentBucketHint = t(
    granularity === 'month'
      ? translations.currentMonth
      : translations.currentYear,
  );

  const bucketColumns = bucketLabels.map<ColumnTemplate<ActivityRow>>(
    (label, index) => ({
      id: `bucket_${index}`,
      title:
        index === inProgressIndex
          ? (): JSX.Element => (
              <Tooltip title={currentBucketHint}>
                <span>{label}*</span>
              </Tooltip>
            )
          : label,
      // The export keeps the asterisk, without the tooltip.
      csvTitle: index === inProgressIndex ? `${label}*` : undefined,
      accessorFn: (row) => row.counts[index],
      cell: (row) => row.counts[index]?.toLocaleString() ?? '—',
      className: 'px-2 text-right tabular-nums',
      sortable: true,
      sortProps: {
        sort: keepOverallFirst((a, b) =>
          compareCounts(a.counts[index], b.counts[index]),
        ),
      },
      csvDownloadable: true,
      csvValue: (value: number | null) => value?.toString() ?? '',
    }),
  );

  const columns: ColumnTemplate<ActivityRow>[] = [
    {
      of: 'name',
      title: t(tableTranslations.instance),
      // The link stops propagation so that following it does not also select the row.
      cell: (row) =>
        row.host ? (
          <Link
            href={`//${row.host}`}
            onClick={(event): void => event.stopPropagation()}
            opensInNewTab
            underline="hover"
          >
            {row.name}
          </Link>
        ) : (
          row.name
        ),
      className: 'min-w-[10rem] max-w-[16rem]',
      sortable: true,
      sortProps: {
        sort: keepOverallFirst((a, b) => a.name.localeCompare(b.name)),
      },
      searchable: true,
      csvDownloadable: true,
    },
    ...bucketColumns,
  ];

  return (
    <>
      <Table
        className="border-none"
        columns={columns}
        csvDownload={{ filename: csvFileName }}
        data={rows}
        getRowClassName={(row): string =>
          [
            `activity_row_${row.key}`,
            row.key === OVERALL_ROW_KEY ? '[&>td]:font-bold' : '',
            row.key === selectedKey ? 'bg-neutral-100' : '',
          ].join(' ')
        }
        getRowId={(row): string => row.key}
        onRowClick={(row): void => props.onSelect(row.key)}
        pagination={{
          rowsPerPage: [DEFAULT_TABLE_ROWS_PER_PAGE],
          showAllRows: true,
        }}
        // Overall stays visible through search. A column made `filterable` later also needs a
        // `filterProps.shouldInclude` that returns true for it.
        search={{
          searchPlaceholder: t(translations.searchInstances),
          alwaysInclude: (row): boolean => row.key === OVERALL_ROW_KEY,
        }}
        toolbar={{ show: true }}
      />
      {inProgressIndex >= 0 && (
        <Typography
          className="mx-6 my-2 block"
          color="text.secondary"
          variant="caption"
        >
          * {currentBucketHint}
        </Typography>
      )}
    </>
  );
};

export default SystemActivityTable;
