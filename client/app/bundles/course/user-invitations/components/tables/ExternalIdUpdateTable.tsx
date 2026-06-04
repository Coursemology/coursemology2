import { FC, ReactNode } from 'react';
import { defineMessages } from 'react-intl';
import { InvitationUpdatedItem } from 'types/course/userInvitations';

import { ColumnTemplate } from 'lib/components/table';
import Table from 'lib/components/table/Table';
import {
  DEFAULT_MINI_TABLE_ROWS_PER_PAGE,
  TIMELINE_ALGORITHMS,
} from 'lib/constants/sharedConstants';
import useTranslation from 'lib/hooks/useTranslation';
import roleTranslations from 'lib/translations/course/users/roles';
import tableTranslations from 'lib/translations/table';

const translations = defineMessages({
  yes: {
    id: 'course.userInvitations.ExternalIdUpdateTable.yes',
    defaultMessage: 'Yes',
  },
  no: {
    id: 'course.userInvitations.ExternalIdUpdateTable.no',
    defaultMessage: 'No',
  },
  existingColumn: {
    id: 'course.userInvitations.ExternalIdUpdateTable.existingColumn',
    defaultMessage: 'Existing',
  },
  inFileColumn: {
    id: 'course.userInvitations.ExternalIdUpdateTable.inFileColumn',
    defaultMessage: 'In file',
  },
  currentColumn: {
    id: 'course.userInvitations.ExternalIdUpdateTable.currentColumn',
    defaultMessage: '{label} (current)',
  },
});

interface Props {
  rows: InvitationUpdatedItem[];
  applied: boolean;
  showPersonalizedTimelineFeatures?: boolean;
}

// The currently-live column (Existing before apply, In file after) gets a full-cell
// blue fill; the other column is muted. Column `className` lands on the MUI TableCell,
// so the whole cell fills cleanly (it also tints the column's header cell — intended:
// the live column reads as one highlighted column, with a "(current)" header label).
const LIVE_CELL_CLASS = 'bg-blue-100 font-semibold text-blue-900';
const MUTED_CELL_CLASS = 'text-neutral-400';

const ExternalIdUpdateTable: FC<Props> = ({
  rows,
  applied,
  showPersonalizedTimelineFeatures,
}) => {
  const { t } = useTranslation();

  if (rows.length === 0) return null;

  const currentTitle = (label: string): string =>
    t(translations.currentColumn, { label });

  const columns: ColumnTemplate<InvitationUpdatedItem>[] = [
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
    {
      of: 'previousExternalId',
      title: applied
        ? t(translations.existingColumn)
        : currentTitle(t(translations.existingColumn)),
      className: applied ? MUTED_CELL_CLASS : LIVE_CELL_CLASS,
      sortable: false,
      cell: (row): ReactNode => row.previousExternalId ?? '—',
      csvDownloadable: true,
    },
    {
      of: 'externalId',
      title: applied
        ? currentTitle(t(translations.inFileColumn))
        : t(translations.inFileColumn),
      className: applied ? LIVE_CELL_CLASS : MUTED_CELL_CLASS,
      sortable: false,
      cell: (row): ReactNode => row.externalId ?? '—',
      csvDownloadable: true,
    },
    {
      of: 'role',
      title: t(tableTranslations.role),
      sortable: false,
      cell: (row): ReactNode => {
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
      cell: (row) => (row.phantom ? t(translations.yes) : t(translations.no)),
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
        ] as ColumnTemplate<InvitationUpdatedItem>[])
      : []),
  ];

  return (
    <Table
      columns={columns}
      data={rows}
      getRowEqualityData={(row) => ({ ...row, applied })}
      getRowId={(row) => String(row.id)}
      pagination={{
        rowsPerPage: [DEFAULT_MINI_TABLE_ROWS_PER_PAGE],
        showAllRows: true,
      }}
      toolbar={{ show: false }}
    />
  );
};

export default ExternalIdUpdateTable;
