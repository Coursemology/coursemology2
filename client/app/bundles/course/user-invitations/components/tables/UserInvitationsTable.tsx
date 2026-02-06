import { FC } from 'react';
import {
  InvitationMiniEntity,
  InvitationType,
} from 'types/course/userInvitations';

import { getManageCourseUserPermissions } from 'course/users/selectors';
import Note from 'lib/components/core/Note';
import GhostIcon from 'lib/components/icons/GhostIcon';
import { ColumnTemplate } from 'lib/components/table';
import Table from 'lib/components/table/Table';
import { TIMELINE_ALGORITHMS } from 'lib/constants/sharedConstants';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDateTime } from 'lib/moment';
import roleTranslations from 'lib/translations/course/users/roles';
import tableTranslations from 'lib/translations/table';

import translations from '../../translations';
import InvitationActionButtons from '../buttons/InvitationActionButtons';
import ResendAllInvitationsButton from '../buttons/ResendAllInvitationsButton';

interface Props {
  invitations: InvitationMiniEntity[];
  selectedType: InvitationType;
}

const UserInvitationsTable: FC<Props> = (props) => {
  const { invitations, selectedType } = props;

  const { t } = useTranslation();
  const permissions = useAppSelector(getManageCourseUserPermissions);

  const columns: ColumnTemplate<InvitationMiniEntity>[] = [
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
      of: 'invitationKey',
      title: t(tableTranslations.invitationCode),
      sortable: true,
      cell: (datum) => datum.invitationKey,
    },
    {
      of: 'sentAt',
      title: t(tableTranslations.invitationSentAt),
      cell: (datum) => formatLongDateTime(datum.sentAt),
      unless: selectedType === 'accepted',
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
      of: 'confirmedAt',
      title: t(tableTranslations.invitationAcceptedAt),
      cell: (datum) => formatLongDateTime(datum.confirmedAt),
      unless: selectedType !== 'accepted',
    },
    {
      id: 'actions',
      title: t(tableTranslations.actions),
      cell: (datum) => (
        <InvitationActionButtons
          invitation={datum}
          isRetryable={selectedType === 'pending'}
        />
      ),
      className: 'text-center',
      unless: selectedType === 'accepted',
    },
  ];

  const buttons: JSX.Element[] = [];

  if (selectedType === 'pending') {
    buttons.push(<ResendAllInvitationsButton key="resend-all" />);
  }

  if (invitations.length === 0) {
    return (
      <Note
        message={t(translations.noInvitations, {
          invitationType: t(translations[selectedType]).toLocaleLowerCase(),
        })}
      />
    );
  }

  return (
    <Table
      className="w-screen border-none sm:w-full"
      columns={columns}
      data={invitations}
      getRowId={(datum) => datum.id.toString()}
      indexing={{ indices: true }}
      toolbar={{
        show: true,
        buttons,
      }}
    />
  );
};

export default UserInvitationsTable;
