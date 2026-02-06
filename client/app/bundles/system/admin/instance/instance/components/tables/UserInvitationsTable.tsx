import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { InvitationMiniEntity } from 'types/system/instance/invitations';
import { InvitationType } from 'types/course/userInvitations';

import Note from 'lib/components/core/Note';
import { ColumnTemplate } from 'lib/components/table';
import Table from 'lib/components/table/Table';
import { INSTANCE_USER_ROLES } from 'lib/constants/sharedConstants';
import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDateTime } from 'lib/moment';
import tableTranslations from 'lib/translations/table';

import InvitationActionButtons from '../buttons/InvitationActionButtons';
import ResendAllInvitationsButton from '../buttons/ResendAllInvitationsButton';

interface Props {
  invitations: InvitationMiniEntity[];
  selectedType: InvitationType;
}

const translations = defineMessages({
  noInvitations: {
    id: 'system.admin.instance.instance.UserInvitationsTable.noInvitations',
    defaultMessage: 'There are no {invitationType} invitations.',
  },
  pending: {
    id: 'system.admin.instance.instance.UserInvitationsTable.pending',
    defaultMessage: 'Pending',
  },
  accepted: {
    id: 'system.admin.instance.instance.UserInvitationsTable.accepted',
    defaultMessage: 'Accepted',
  },
  failed: {
    id: 'system.admin.instance.instance.UserInvitationsTable.failed',
    defaultMessage: 'Failed',
  },
});

const UserInvitationsTable: FC<Props> = (props) => {
  const { invitations, selectedType } = props;

  const { t } = useTranslation();

  const columns: ColumnTemplate<InvitationMiniEntity>[] = [
    {
      of: 'name',
      title: t(tableTranslations.name),
      sortable: true,
      searchable: true,
      cell: (datum) => datum.name,
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
      cell: (datum) => INSTANCE_USER_ROLES[datum.role],
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
      of: 'confirmedAt',
      title: t(tableTranslations.invitationAcceptedAt),
      cell: (datum) => formatLongDateTime(datum.confirmedAt),
      unless: selectedType !== 'accepted',
    },
    {
      id: 'actions',
      title: t(tableTranslations.actions),
      cell: (datum) => <InvitationActionButtons invitation={datum} />,
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
