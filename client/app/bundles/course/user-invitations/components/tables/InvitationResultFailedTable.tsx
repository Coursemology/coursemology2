import { FC, memo, ReactNode } from 'react';
import { defineMessages } from 'react-intl';
import equal from 'fast-deep-equal';
import {
  FailedInvitationRowData,
  InvitationFailureReason,
} from 'types/course/userInvitations';

import { ColumnTemplate } from 'lib/components/table';
import Table from 'lib/components/table/Table';
import { TIMELINE_ALGORITHMS } from 'lib/constants/sharedConstants';
import useTranslation from 'lib/hooks/useTranslation';
import libTranslations from 'lib/translations';
import roleTranslations from 'lib/translations/course/users/roles';
import tableTranslations from 'lib/translations/table';

const translations = defineMessages({
  duplicateEmailInFile: {
    id: 'course.userInvitations.InvitationResultFailedTable.duplicateEmailInFile',
    defaultMessage: 'Duplicate email in uploaded CSV',
  },
  duplicateExternalIdInFile: {
    id: 'course.userInvitations.InvitationResultFailedTable.duplicateExternalIdInFile',
    defaultMessage: 'Duplicate external ID in uploaded CSV',
  },
  externalIdTaken: {
    id: 'course.userInvitations.InvitationResultFailedTable.externalIdTaken',
    defaultMessage: 'External ID is taken by another course member',
  },
  missingEmail: {
    id: 'course.userInvitations.InvitationResultFailedTable.missingEmail',
    defaultMessage: 'Missing email',
  },
  failedToSend: {
    id: 'course.userInvitations.InvitationResultFailedTable.failedToSend',
    defaultMessage:
      'Failed to send invitation email, please try again - if failures persist, contact us for assistance',
  },
});

interface Props {
  users: FailedInvitationRowData[];
  showPersonalizedTimelineFeatures?: boolean;
}

const REASON_MAP: Record<InvitationFailureReason, keyof typeof translations> = {
  duplicate_email_in_file: 'duplicateEmailInFile',
  duplicate_external_id_in_file: 'duplicateExternalIdInFile',
  external_id_taken: 'externalIdTaken',
  missing_email: 'missingEmail',
  failed_to_send: 'failedToSend',
};

const InvitationResultFailedTable: FC<Props> = ({
  users,
  showPersonalizedTimelineFeatures,
}) => {
  const { t } = useTranslation();

  if (users.length === 0) return null;

  const showExternalId = users.some((u) => u.externalId != null);

  const columns: ColumnTemplate<FailedInvitationRowData>[] = [
    {
      of: 'name',
      title: t(tableTranslations.name),
      sortable: false,
      searchable: true,
      cell: (row) => row.name,
      csvDownloadable: true,
    },
    {
      of: 'email',
      title: t(tableTranslations.email),
      sortable: false,
      searchable: true,
      cell: (row) => row.email,
      csvDownloadable: true,
    },
    ...(showExternalId
      ? ([
          {
            of: 'externalId',
            title: t(tableTranslations.externalId),
            sortable: false,
            searchable: false,
            cell: (row) => row.externalId ?? '',
            csvDownloadable: true,
          },
        ] as ColumnTemplate<FailedInvitationRowData>[])
      : []),
    {
      of: 'role',
      title: t(tableTranslations.role),
      sortable: false,
      searchable: false,
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
      searchable: false,
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
            searchable: false,
            cell: (row): ReactNode =>
              TIMELINE_ALGORITHMS.find(
                (tl) => tl.value === row.timelineAlgorithm,
              )?.label ?? '-',
            csvDownloadable: true,
          },
        ] as ColumnTemplate<FailedInvitationRowData>[])
      : []),
    {
      of: 'reason',
      title: t(tableTranslations.reason),
      sortable: false,
      searchable: false,
      cell: (row): ReactNode => {
        return t(translations[REASON_MAP[row.reason]]);
      },
      csvDownloadable: true,
    },
  ];

  return (
    <Table
      columns={columns}
      data={users}
      getRowClassName={(row) =>
        row.reason === 'failed_to_send' ? 'bg-[#ffebee]' : ''
      }
      getRowEqualityData={(row) => row}
      getRowId={(row) => String(row.id)}
      toolbar={{ show: false }}
    />
  );
};

export default memo(
  InvitationResultFailedTable,
  (prev, next) =>
    equal(prev.users, next.users) &&
    prev.showPersonalizedTimelineFeatures ===
      next.showPersonalizedTimelineFeatures,
);
