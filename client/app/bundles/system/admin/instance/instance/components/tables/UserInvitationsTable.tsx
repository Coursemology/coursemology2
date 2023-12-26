import { FC, memo, ReactElement } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Typography } from '@mui/material';
import equal from 'fast-deep-equal';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import {
  InvitationMiniEntity,
  InvitationRowData,
} from 'types/system/instance/invitations';

import DataTable from 'lib/components/core/layouts/DataTable';
import Note from 'lib/components/core/Note';
import { INSTANCE_USER_ROLES } from 'lib/constants/sharedConstants';
import rebuildObjectFromRow from 'lib/helpers/mui-datatables-helpers';
import { formatLongDateTime } from 'lib/moment';
import tableTranslations from 'lib/translations/table';

import ResendAllInvitationsButton from '../buttons/ResendAllInvitationsButton';

interface Props extends WrappedComponentProps {
  title: string;
  invitations: InvitationMiniEntity[];
  pendingInvitations?: boolean;
  acceptedInvitations?: boolean;
  renderRowActionComponent?: (invitation: InvitationRowData) => ReactElement;
}

const translations = defineMessages({
  noInvitations: {
    id: 'system.admin.instance.instance.UserInvitationsTable.noInvitations',
    defaultMessage: 'There are no {invitationType}',
  },
  pending: {
    id: 'system.admin.instance.instance.UserInvitationsTable.pending',
    defaultMessage: 'pending',
  },
  accepted: {
    id: 'system.admin.instance.instance.UserInvitationsTable.accepted',
    defaultMessage: 'accepted',
  },
});

const UserInvitationsTable: FC<Props> = (props) => {
  const {
    title,
    invitations,
    pendingInvitations = false,
    acceptedInvitations = false,
    renderRowActionComponent = null,
    intl,
  } = props;

  if (invitations && invitations.length === 0) {
    return (
      <Note
        message={intl.formatMessage(translations.noInvitations, {
          invitationType: title.toLowerCase(),
        })}
      />
    );
  }

  const invitationTypePrefix: string = pendingInvitations
    ? intl.formatMessage(translations.pending)
    : intl.formatMessage(translations.accepted);

  const options: TableOptions = {
    download: false,
    filter: false,
    pagination: true,
    print: false,
    rowsPerPage: 50,
    rowsPerPageOptions: [15, 30, 50, 100],
    search: true,
    selectableRows: 'none',
    setTableProps: (): Record<string, unknown> => {
      return { size: 'small' };
    },
    setRowProps: (_row, dataIndex, _rowIndex): Record<string, unknown> => {
      return {
        key: `invitation_${invitations[dataIndex].id}`,
        invitationid: `invitation_${invitations[dataIndex].id}`,
        className: `invitation ${invitationTypePrefix}_invitation_${invitations[dataIndex].id}`,
      };
    },
    viewColumns: false,
    ...(pendingInvitations && {
      customToolbar: () => <ResendAllInvitationsButton />,
    }),
  };

  const columns: TableColumns[] = [
    {
      name: 'id',
      label: intl.formatMessage(tableTranslations.id),
      options: {
        display: false,
        filter: false,
        sort: false,
      },
    },
    {
      name: 'name',
      label: intl.formatMessage(tableTranslations.name),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const invitation = invitations[dataIndex];
          return (
            <Typography key={`name-${invitation.id}`} variant="body2">
              {invitation.name}
            </Typography>
          );
        },
      },
    },
    {
      name: 'email',
      label: intl.formatMessage(tableTranslations.email),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const invitation = invitations[dataIndex];
          return (
            <Typography key={`email-${invitation.id}`} variant="body2">
              {invitation.email}
            </Typography>
          );
        },
      },
    },
    {
      name: 'role',
      label: intl.formatMessage(tableTranslations.role),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const invitation = invitations[dataIndex];
          return (
            <Typography key={`role-${invitation.id}`} variant="body2">
              {INSTANCE_USER_ROLES[invitation.role]}
            </Typography>
          );
        },
      },
    },
    {
      name: 'invitationCode',
      label: intl.formatMessage(tableTranslations.invitationCode),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const invitation = invitations[dataIndex];
          return (
            <Typography key={`invitationCode-${invitation.id}`} variant="body2">
              {invitation.invitationKey}
            </Typography>
          );
        },
      },
    },
    {
      name: 'sentAt',
      label: intl.formatMessage(tableTranslations.invitationSentAt),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const invitation = invitations[dataIndex];
          return (
            <Typography key={invitation.id} variant="body2">
              {formatLongDateTime(invitation.sentAt)}
            </Typography>
          );
        },
      },
    },
  ];

  if (acceptedInvitations) {
    columns.push({
      name: 'acceptedAt',
      label: intl.formatMessage(tableTranslations.invitationAcceptedAt),
      options: {
        alignCenter: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const invitation = invitations[dataIndex];
          return (
            <Typography key={invitation.id} variant="body2">
              {formatLongDateTime(invitation.confirmedAt)}
            </Typography>
          );
        },
      },
    });
  }

  if (renderRowActionComponent) {
    columns.push({
      name: 'actions',
      label: intl.formatMessage(tableTranslations.actions),
      options: {
        empty: true,
        sort: false,
        alignCenter: true,
        customBodyRender: (_value, tableMeta): JSX.Element => {
          const rowData = tableMeta.rowData;
          const invitation = rebuildObjectFromRow(columns, rowData);
          return renderRowActionComponent(invitation as InvitationRowData);
        },
      },
    });
  }

  return (
    <DataTable
      columns={columns}
      data={invitations}
      includeRowNumber
      options={options}
      title={title}
      withMargin
    />
  );
};

export default memo(
  injectIntl(UserInvitationsTable),
  (prevProps, nextProps) => {
    return equal(prevProps.invitations, nextProps.invitations);
  },
);
