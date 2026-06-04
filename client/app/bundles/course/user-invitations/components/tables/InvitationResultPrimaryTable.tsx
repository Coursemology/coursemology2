import { FC, ReactNode } from 'react';
import { InvitationSuccessRow } from 'types/course/userInvitations';

import { ColumnTemplate } from 'lib/components/table';
import Table from 'lib/components/table/Table';
import {
  DEFAULT_MINI_TABLE_ROWS_PER_PAGE,
  DEFAULT_TABLE_ROWS_PER_PAGE,
  TIMELINE_ALGORITHMS,
} from 'lib/constants/sharedConstants';
import useTranslation from 'lib/hooks/useTranslation';
import libTranslations from 'lib/translations';
import roleTranslations from 'lib/translations/course/users/roles';
import tableTranslations from 'lib/translations/table';

interface Props {
  rows: InvitationSuccessRow[];
  showPersonalizedTimelineFeatures?: boolean;
}

const InvitationResultPrimaryTable: FC<Props> = ({
  rows,
  showPersonalizedTimelineFeatures,
}) => {
  const { t } = useTranslation();
  const showExternalId = rows.some((r) => r.externalId != null);

  const columns: ColumnTemplate<InvitationSuccessRow>[] = [
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
            cell: (row) => row.externalId ?? '',
            csvDownloadable: true,
          },
        ] as ColumnTemplate<InvitationSuccessRow>[])
      : []),
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
        ] as ColumnTemplate<InvitationSuccessRow>[])
      : []),
  ];

  return (
    <Table
      columns={columns}
      data={rows}
      getRowEqualityData={(row) => row}
      getRowId={(row) => row.id}
      pagination={{
        rowsPerPage: [DEFAULT_MINI_TABLE_ROWS_PER_PAGE],
        showAllRows: false,
      }}
      toolbar={{ show: false }}
    />
  );
};

export default InvitationResultPrimaryTable;
