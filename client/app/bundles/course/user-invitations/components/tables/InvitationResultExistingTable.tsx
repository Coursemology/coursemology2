import { FC, ReactNode } from 'react';
import { defineMessages } from 'react-intl';
import { Tooltip } from '@mui/material';
import { TimelineAlgorithm } from 'types/course/personalTimes';

import { ColumnTemplate } from 'lib/components/table';
import Table from 'lib/components/table/Table';
import {
  DEFAULT_TABLE_ROWS_PER_PAGE,
  TIMELINE_ALGORITHMS,
} from 'lib/constants/sharedConstants';
import useTranslation from 'lib/hooks/useTranslation';
import libTranslations from 'lib/translations';
import roleTranslations from 'lib/translations/course/users/roles';
import tableTranslations from 'lib/translations/table';

const translations = defineMessages({
  previouslyLabel: {
    id: 'course.userInvitations.InvitationResultExistingTable.previouslyLabel',
    defaultMessage: 'Previously: {value}',
  },
});

export interface ExistingRow {
  id: number;
  name: string;
  email: string;
  externalId?: string | null;
  role?: string;
  phantom?: boolean;
  previousExternalId?: string | null;
  timelineAlgorithm?: TimelineAlgorithm;
}

interface Props {
  rows: ExistingRow[];
  showPersonalizedTimelineFeatures?: boolean;
}

const InvitationResultExistingTable: FC<Props> = ({
  rows,
  showPersonalizedTimelineFeatures,
}) => {
  const { t } = useTranslation();

  if (rows.length === 0) return null;

  // Updated rows (ext_id changed) first so admins notice them above unchanged existing rows
  const orderedRows = [
    ...rows.filter((r) => r.previousExternalId !== undefined),
    ...rows.filter((r) => r.previousExternalId === undefined),
  ];

  const showExternalId = rows.some(
    (r) => r.externalId != null || r.previousExternalId !== undefined,
  );

  const columns: ColumnTemplate<ExistingRow>[] = [
    {
      of: 'name',
      title: t(tableTranslations.name),
      sortable: false,
      cell: (row) => row.name,
      csvDownloadable: true,
    },
    {
      of: 'email',
      title: t(tableTranslations.email),
      sortable: false,
      cell: (row) => row.email,
      csvDownloadable: true,
    },
    ...(showExternalId
      ? ([
          {
            of: 'externalId',
            title: t(tableTranslations.externalId),
            sortable: false,
            cell: (row): ReactNode => {
              if (row.previousExternalId === undefined)
                return row.externalId ?? '';
              const previousLabel = t(translations.previouslyLabel, {
                value: row.previousExternalId ?? '—',
              });
              return (
                <Tooltip title={previousLabel}>
                  <strong style={{ cursor: 'default' }}>
                    {row.externalId}
                  </strong>
                </Tooltip>
              );
            },
            csvDownloadable: true,
          },
        ] as ColumnTemplate<ExistingRow>[])
      : []),
    {
      of: 'role',
      title: t(tableTranslations.role),
      sortable: false,
      cell: (row): ReactNode => {
        if (!row.role) return '';
        const desc =
          roleTranslations[row.role as keyof typeof roleTranslations];
        return desc ? t(desc) : row.role;
      },
      csvDownloadable: true,
    },
    {
      of: 'phantom',
      title: t(tableTranslations.phantom),
      sortable: false,
      cell: (row) =>
        row.phantom ? t(libTranslations.yes) : t(libTranslations.no),
      csvDownloadable: true,
    },
    ...(showPersonalizedTimelineFeatures
      ? ([
          {
            of: 'timelineAlgorithm',
            title: t(tableTranslations.personalizedTimeline),
            sortable: false,
            cell: (row): ReactNode =>
              TIMELINE_ALGORITHMS.find(
                (tl) => tl.value === row.timelineAlgorithm,
              )?.label ?? '-',
            csvDownloadable: true,
          },
        ] as ColumnTemplate<ExistingRow>[])
      : []),
  ];

  return (
    <Table
      columns={columns}
      data={orderedRows}
      getRowClassName={(row) =>
        row.previousExternalId !== undefined ? 'bg-[#e3f2fd]' : ''
      }
      getRowEqualityData={(row) => row}
      getRowId={(row) => String(row.id)}
      pagination={{
        rowsPerPage: [DEFAULT_TABLE_ROWS_PER_PAGE],
        showAllRows: true,
      }}
      toolbar={{ show: false }}
    />
  );
};

export default InvitationResultExistingTable;
