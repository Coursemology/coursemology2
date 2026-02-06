import { FC } from 'react';
import { DoneAll, ErrorOutline, Schedule } from '@mui/icons-material';
import { Chip, Tooltip } from '@mui/material';
import {
  InvitationMiniEntity,
  InvitationStatus,
} from 'types/course/userInvitations';

import { getManageCourseUserPermissions } from 'course/users/selectors';
import Note from 'lib/components/core/Note';
import GhostIcon from 'lib/components/icons/GhostIcon';
import { ColumnTemplate } from 'lib/components/table';
import Table from 'lib/components/table/Table';
import { TIMELINE_ALGORITHMS } from 'lib/constants/sharedConstants';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';
import { formatMiniDateTime } from 'lib/moment';
import roleTranslations from 'lib/translations/course/users/roles';
import tableTranslations from 'lib/translations/table';

import translations from '../../translations';
import InvitationActionButtons from '../buttons/InvitationActionButtons';
import ResendAllInvitationsButton from '../buttons/ResendAllInvitationsButton';

interface Props {
  invitations: InvitationMiniEntity[];
}

interface InvitationRowData extends InvitationMiniEntity {
  status: InvitationStatus;
}

function getInvitationStatus(
  invitation: InvitationMiniEntity,
): InvitationStatus {
  if (invitation.confirmed) {
    return 'accepted';
  }
  if (invitation.isRetryable) {
    return 'pending';
  }
  return 'failed';
}

const InvitationStatusValueMapper: Record<InvitationStatus, number> = {
  failed: 0,
  pending: 1,
  accepted: 2,
};

function sortInvitationsByStatus(
  a: InvitationRowData,
  b: InvitationRowData,
): number {
  return (
    InvitationStatusValueMapper[a.status] -
    InvitationStatusValueMapper[b.status]
  );
}

const AcceptedChip: FC<{ sentAt: string; confirmedAt: string }> = ({
  sentAt,
  confirmedAt,
}) => {
  const { t } = useTranslation();

  return (
    <Tooltip
      title={
        <>
          <div>
            {t(translations.sentTooltip, {
              sentAt: formatMiniDateTime(sentAt),
            })}
          </div>
          <div>
            {t(translations.confirmedTooltip, {
              confirmedAt: formatMiniDateTime(confirmedAt),
            })}
          </div>
        </>
      }
    >
      <Chip
        className="bg-green-100 w-fit"
        icon={<DoneAll />}
        label={t(translations.accepted)}
        size="small"
        variant="filled"
      />
    </Tooltip>
  );
};

const PendingChip: FC<{ sentAt: string }> = ({ sentAt }) => {
  const { t } = useTranslation();

  return (
    <Tooltip
      title={t(translations.sentTooltip, {
        sentAt: formatMiniDateTime(sentAt),
      })}
    >
      <Chip
        className="bg-amber-100 w-fit"
        icon={<Schedule />}
        label={t(translations.pending)}
        size="small"
        variant="filled"
      />
    </Tooltip>
  );
};

const FailedChip: FC<{ sentAt: string }> = ({ sentAt }) => {
  const { t } = useTranslation();

  return (
    <Tooltip
      title={t(translations.sentTooltip, {
        sentAt: formatMiniDateTime(sentAt),
      })}
    >
      <Chip
        className="bg-red-100 w-fit"
        icon={<ErrorOutline />}
        label={t(translations.failed)}
        size="small"
        variant="filled"
      />
    </Tooltip>
  );
};

const UserInvitationsTable: FC<Props> = (props) => {
  const { invitations } = props;

  const { t } = useTranslation();
  const permissions = useAppSelector(getManageCourseUserPermissions);

  const columns: ColumnTemplate<InvitationRowData>[] = [
    {
      of: 'name',
      title: t(tableTranslations.name),
      sortable: true,
      searchable: true,
      cell: (datum) => (
        <div className="flex grow items-center">
          {datum.name}
          {datum.phantom && <GhostIcon className="ml-2" fontSize="small" />}
        </div>
      ),
    },
    {
      of: 'email',
      title: t(tableTranslations.email),
      sortable: true,
      searchable: true,
      cell: (datum) => datum.email,
    },
    {
      of: 'role',
      title: t(tableTranslations.role),
      sortable: true,
      cell: (datum) => t(roleTranslations[datum.role]),
    },
    {
      of: 'timelineAlgorithm',
      title: t(tableTranslations.personalizedTimeline),
      cell: (datum) =>
        TIMELINE_ALGORITHMS.find(
          (timeline) => timeline.value === datum.timelineAlgorithm,
        )?.label ?? '-',
      unless: !permissions.canManagePersonalTimes,
    },
    {
      id: 'status',
      title: t(tableTranslations.status),
      cell: (datum): JSX.Element => {
        if (datum.status === 'accepted') {
          return (
            <AcceptedChip
              confirmedAt={datum.confirmedAt!}
              sentAt={datum.sentAt!}
            />
          );
        }
        if (datum.status === 'pending') {
          return <PendingChip sentAt={datum.sentAt!} />;
        }
        return <FailedChip sentAt={datum.sentAt!} />;
      },
      sortable: true,
      sortProps: {
        sort: sortInvitationsByStatus,
      },
      filterable: true,
      filterProps: {
        getValue: (datum) => [t(translations[datum.status])],
        shouldInclude: (datum, filterValue?: string[]): boolean => {
          if (!filterValue?.length) return true;

          const filterSet = new Set(filterValue);
          return filterSet.has(t(translations[datum.status]));
        },
      },
      searchProps: {
        getValue: (datum) => datum.status,
      },
    },
    {
      of: 'invitationKey',
      title: t(tableTranslations.invitationCode),
      sortable: true,
      cell: (datum) => datum.invitationKey,
      className: 'max-lg:!hidden',
    },
    {
      of: 'sentAt',
      title: t(tableTranslations.invitationSentAt),
      cell: (datum) => formatMiniDateTime(datum.sentAt),
      className: 'max-xl:!hidden',
    },
    {
      of: 'confirmedAt',
      title: t(tableTranslations.invitationAcceptedAt),
      cell: (datum) => formatMiniDateTime(datum.confirmedAt),
      className: 'max-xl:!hidden',
    },
    {
      id: 'actions',
      title: t(tableTranslations.actions),
      cell: (datum): JSX.Element | null => {
        if (datum.status !== 'accepted') {
          return (
            <InvitationActionButtons
              invitation={datum}
              isRetryable={datum.status === 'pending'}
            />
          );
        }
        return null;
      },
      className: 'text-center',
    },
  ];

  if (invitations.length === 0) {
    return <Note message={t(translations.noInvitations)} />;
  }

  const processedInvitations: InvitationRowData[] = invitations
    .map((invitation) => ({
      ...invitation,
      status: getInvitationStatus(invitation),
    }))
    .toSorted(sortInvitationsByStatus);

  return (
    <Table
      className="w-screen border-none sm:w-full"
      columns={columns}
      data={processedInvitations}
      getRowId={(datum) => datum.id.toString()}
      indexing={{ indices: true }}
      sort={{
        initially: { by: 'status', order: 'asc' },
      }}
      toolbar={{
        show: true,
        buttons: [
          <ResendAllInvitationsButton
            key="resend-all"
            count={
              processedInvitations.filter(
                (invitation) => invitation.status === 'pending',
              ).length
            }
          />,
        ],
      }}
    />
  );
};

export default UserInvitationsTable;
